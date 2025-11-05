"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getBankDetailsByDoctorId, saveOrUpdateBankDetails, getBankCodeDetail, uploadPdf, getDocumentsByDoctorId } from "../services/api"
import { processCancelledChequeOCR } from "../services/oculonApi"

type Data = {
  accountNumber: string
  confirmAccountNumber: string
  accountHolder: string
  ifsc: string
  accountType: string
  bankName: string
  branch: string
}

type Props = {
  initial?: Partial<Data>
  onSubmitAll: (data: Data) => void
  onBack: () => void
}

export default function BankDetails({ initial, onSubmitAll, onBack }: Props) {
  const [form, setForm] = useState<Data>({
    accountNumber: initial?.accountNumber || "",
    confirmAccountNumber: initial?.confirmAccountNumber || "",
    accountHolder: initial?.accountHolder || "",
    ifsc: initial?.ifsc || "",
    accountType: initial?.accountType || "Current Account",
    bankName: initial?.bankName || "",
    branch: initial?.branch || "",
  })
  const [loading, setLoading] = useState(true)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ifscLoading, setIfscLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedChequeUrl, setUploadedChequeUrl] = useState<string | null>(null)

  // Load existing bank details on component mount
  useEffect(() => {
    const loadBankDetails = async () => {
      try {
        const doctorId = localStorage.getItem('doctorId')
        if (doctorId) {
          const response = await getBankDetailsByDoctorId(doctorId)
          if (response.status === 200 && response.data) {
            const data = response.data
            setForm({
              accountNumber: data.accountNumber || "",
              confirmAccountNumber: "", // Don't pre-fill confirm field
              accountHolder: data.accountHolderName || "",
              ifsc: data.ifscCode || "",
              accountType: data.accountType || "Current Account",
              bankName: data.bankName || "",
              branch: data.branchName || "",
            })
            console.log("Bank details loaded:", data)
          }
        }

        // Load existing cancel check document
        if (doctorId) {
          try {
            const documentsResponse = await getDocumentsByDoctorId(doctorId)
            if (documentsResponse.status === 200 && documentsResponse.data?.otherDocUrl) {
              setUploadedChequeUrl(documentsResponse.data.otherDocUrl)
              console.log("Cancel check document loaded:", documentsResponse.data.otherDocUrl)
            }
          } catch (error) {
            console.error("Error loading cancel check document:", error)
          }
        }
      } catch (error) {
        console.error("Error loading bank details:", error)
        // Continue with initial form data if error
      } finally {
        setLoading(false)
      }
    }

    loadBankDetails()
  }, [])

  const update = (k: keyof Data, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const validateForm = () => {
    setError(null) // Clear any existing errors
    if (form.accountNumber !== form.confirmAccountNumber) {
      setError("Account number and confirm account number do not match.")
      return false
    }
    if (!form.accountNumber || !form.accountHolder || !form.ifsc || !form.bankName || !form.branch) {
      setError("Please fill in all required fields.")
      return false
    }
    return true
  }

  const validateAndFetchIFSCDetails = async (ifscCode: string) => {
    // Basic IFSC format validation (11 characters, alphanumeric)
    if (ifscCode.length !== 11) {
      return
    }

    setIfscLoading(true)
    try {
      const bankDetails = await getBankCodeDetail(ifscCode, "branch")
      
      if (bankDetails) {
        // Auto-fill bank name and branch name
        setForm(prev => ({
          ...prev,
          bankName: bankDetails.branchName || prev.bankName, // Using branchName as bankName
          branch: bankDetails.branchCode || prev.branch, // Using branchCode as branch
        }))
      }
    } catch (error) {
      console.error('Error fetching IFSC details:', error)
      // Don't show error to user as they might still be typing
    } finally {
      setIfscLoading(false)
    }
  }

  // Debounced IFSC validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (form.ifsc && form.ifsc.length === 11) {
        validateAndFetchIFSCDetails(form.ifsc)
      }
    }, 1000) // 1 second debounce

    return () => clearTimeout(timeoutId)
  }, [form.ifsc])

  const handleCancelledChequeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG) or PDF')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size should be less than 10MB')
      return
    }

    setOcrLoading(true)
    try {
      // Step 1: Upload PDF first
      const doctorId = localStorage.getItem('doctorId')
      if (!doctorId) {
        setError("Doctor ID not found. Please try again.")
        return
      }

      // Determine file type for upload
      const fileType = file.type === 'application/pdf' ? 'pdf' : 'img'
      
      console.log('Uploading cancelled cheque file...')
      const uploadResult = await uploadPdf(file, 'cancelCheck', fileType, doctorId)
      
      if (uploadResult.status !== 200) {
        setError('Failed to upload cancelled cheque file. Please try again.')
        return
      }

      // Store the uploaded file URL for preview
      setUploadedChequeUrl(uploadResult.data)

      console.log('File uploaded successfully, now processing OCR...')
      
      // Step 2: Process OCR on the uploaded file
      const result = await processCancelledChequeOCR(file)
      
      if (result.success && result.data) {
        // Auto-fill form fields with OCR data
        setForm(prev => ({
          ...prev,
          accountNumber: result.data.account_number || prev.accountNumber,
          confirmAccountNumber: "", // Don't auto-fill confirm field - user must type manually
          accountHolder: result.data.account_holder_name || prev.accountHolder,
          ifsc: result.data.ifsc_code || prev.ifsc,
          // Note: OCR doesn't provide bank name and branch, so we keep existing values
        }))
        
        setError('Cancelled cheque uploaded and details extracted successfully!')
      } else {
        setError('File uploaded successfully but failed to extract details from cancelled cheque. Please try again or enter manually.')
      }
    } catch (error) {
      console.error('Error processing cancelled cheque:', error)
      setError('Error processing cancelled cheque. Please try again or enter details manually.')
    } finally {
      setOcrLoading(false)
      // Reset file input
      event.target.value = ''
    }
  }
  
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      const doctorId = localStorage.getItem('doctorId')
      if (!doctorId) {
        setError("Doctor ID not found. Please try again.")
        return
      }

      // Prepare data for API
      const bankData = {
        id: "",
        doctorId: doctorId,
        accountHolderName: form.accountHolder,
        accountNumber: form.accountNumber,
        accountType: form.accountType,
        bankAddress: "", // This might need to be fetched from IFSC API
        bankName: form.bankName,
        branchName: form.branch,
        ifscCode: form.ifsc
      }

      // Save bank details
      const response = await saveOrUpdateBankDetails(bankData)
      
      if (response.status === 200) {
        console.log("Bank details saved successfully:", response.data)
        onSubmitAll(form)
      } else {
        setError("Failed to save bank details. Please try again.")
      }
    } catch (error) {
      console.error("Error saving bank details:", error)
      setError("Error saving bank details. Please check your connection and try again.")
    }
  }

  if (loading) {
    return (
      <section className="card card--padded">
        <div className="loading">Loading bank details...</div>
      </section>
    )
  }

  return (
    <section className="card card--padded">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="title">Bank details</h2>
        <div style={{ position: 'relative' }}>
          <input
            type="file"
            id="cancelled-cheque-upload"
            accept="image/*,.pdf"
            onChange={handleCancelledChequeUpload}
            style={{ display: 'none' }}
            disabled={ocrLoading}
          />
          <label
            htmlFor="cancelled-cheque-upload"
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: ocrLoading ? '#ccc' : '#007bff',
              color: 'white',
              borderRadius: '4px',
              cursor: ocrLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              border: 'none',
              transition: 'background-color 0.2s'
            }}
          >
            {ocrLoading ? 'Processing...' : '📄 Upload Cancelled Cheque'}
          </label>
        </div>
      </div>

      {/* Error Message Display */}
      {error && (
        <div style={{
          backgroundColor: error.includes('successfully') ? '#d4edda' : '#f8d7da',
          color: error.includes('successfully') ? '#155724' : '#721c24',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: error.includes('successfully') ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: error.includes('successfully') ? '#155724' : '#721c24',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '0'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Cancelled Cheque Preview */}
      {uploadedChequeUrl && (
        <div style={{ marginBottom: '1rem' }}>
          <label className="label">Uploaded Cancelled Cheque Preview</label>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '16px',
            backgroundColor: '#f9f9f9',
            textAlign: 'center'
          }}>
            {uploadedChequeUrl.toLowerCase().includes('.pdf') ? (
              <div>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>📄</div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                  Cancelled Cheque PDF Uploaded
                </div>
                <a 
                  href={uploadedChequeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#007bff', 
                    textDecoration: 'none',
                    fontSize: '12px'
                  }}
                >
                  View PDF →
                </a>
              </div>
            ) : (
              <div>
                <img 
                  src={uploadedChequeUrl} 
                  alt="Uploaded cancelled cheque preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px', 
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `
                      <div style="font-size: 48px; margin-bottom: 8px;">📄</div>
                      <div style="font-size: 14px; color: #666;">Cancelled Cheque Preview</div>
                      <a href="${uploadedChequeUrl}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: none; font-size: 12px;">View Image →</a>
                    `;
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={submit} className="form">
        <label className="label">Account Number</label>
        <input
          inputMode="numeric"
          className="input"
          placeholder="Enter your account number"
          value={form.accountNumber}
          onChange={(e) => update("accountNumber", e.target.value.replace(/\D/g, ""))}
        />

        <label className="label">Confirm account Number</label>
        <input
          inputMode="numeric"
          className="input"
          placeholder="Confirm your account number"
          value={form.confirmAccountNumber}
          onChange={(e) => update("confirmAccountNumber", e.target.value.replace(/\D/g, ""))}
        />

        <label className="label">Account holder's name</label>
        <input 
          className="input" 
          placeholder="Enter account holder's name"
          value={form.accountHolder} 
          onChange={(e) => update("accountHolder", e.target.value)} 
        />

        <label className="label">IFSC Code</label>
        <div style={{ position: 'relative' }}>
          <input 
            className="input" 
            placeholder="Enter IFSC"
            value={form.ifsc} 
            onChange={(e) => update("ifsc", e.target.value.toUpperCase())} 
            style={{ paddingRight: ifscLoading ? '2.5rem' : '1rem' }}
          />
          {ifscLoading && (
            <div style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.875rem',
              color: '#666'
            }}>
              Loading...
            </div>
          )}
        </div>

        <label className="label">Account type</label>
        <select 
          className="input" 
          value={form.accountType} 
          onChange={(e) => update("accountType", e.target.value)}
        >
          <option value="Current Account">Current Account</option>
          <option value="Savings Account">Savings Account</option>
        </select>

        <label className="label">Bank name</label>
        <input 
          className="input" 
          placeholder="Bank name"
          value={form.bankName} 
          onChange={(e) => update("bankName", e.target.value)} 
        />

        <label className="label">Branch name</label>
        <input 
          className="input" 
          placeholder="Bank name"
          value={form.branch} 
          onChange={(e) => update("branch", e.target.value)} 
        />

        <div className="row">
          <button className="btn btn--ghost" type="button" onClick={onBack}>
            Back
          </button>
          <button className="btn btn--primary" type="submit">
            Next
          </button>
        </div>
      </form>
    </section>
  )
}
