"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
 import { saveOrUpdateDoctorDetails, getDoctorDetailsByPhoneNumber, uploadPdf, getAllScoutCodes, ScoutCode, getDocumentsByDoctorId } from "../services/api"
import { getPhonePrefillData, processPanCardOCR } from "../services/oculonApi"

// Date formatting utility functions
const formatDateForDatePicker = (dateString: string): string => {
  if (!dateString) return ""
  
  // Handle DD-MM-YYYY format (from API responses)
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('-')
    return `${year}-${month}-${day}` // Convert to YYYY-MM-DD for date picker
  }
  
  // Handle YYYY-MM-DD format (already correct for date picker)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString
  }
  
  // Handle other date formats by parsing with Date object
  try {
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  } catch (error) {
    console.error("Error parsing date:", dateString, error)
  }
  
  return ""
}

const formatDateForAPI = (dateString: string): string => {
  if (!dateString) return ""
  
  // Handle YYYY-MM-DD format (from date picker)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-')
    return `${day}-${month}-${year}` // Convert to DD-MM-YYYY for API
  }
  
  // Handle DD-MM-YYYY format (already correct for API)
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    return dateString
  }
  
  // Handle other date formats by parsing with Date object
  try {
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}-${month}-${year}`
    }
  } catch (error) {
    console.error("Error parsing date for API:", dateString, error)
  }
  
  return ""
}

const parseDateFromAPIResponse = (dateString: string): string => {
  if (!dateString) return ""
  
  // Handle DD-MM-YYYY format (from API responses)
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    return formatDateForDatePicker(dateString)
  }
  
  // Handle MM/DD/YYYY format (from some API responses)
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    const [month, day, year] = dateString.split('/')
    const formattedDate = `${day}-${month.padStart(2, '0')}-${year}`
    return formatDateForDatePicker(formattedDate)
  }
  
  // Handle YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString
  }
  
  // Handle date with time (extract date part only)
  if (dateString.includes(' ')) {
    const datePart = dateString.split(' ')[0]
    return parseDateFromAPIResponse(datePart)
  }
  
  // Handle other formats
  try {
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  } catch (error) {
    console.error("Error parsing date from API response:", dateString, error)
  }
  
  return ""
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

type Data = {
  phone: string
  fullName: string
  pan: string
  email: string
  dob: string
  scoutCode?: string
}

type Props = {
  initial: Partial<Data> & { phone: string }
  onNext: (data: Data) => void
}

export default function PersonalDetails({ initial, onNext }: Props) {
  const [form, setForm] = useState<Data>({
    phone: initial.phone || "",
    fullName: initial.fullName || "",
    pan: initial.pan || "",
    email: initial.email || "",
    dob: initial.dob || "",
    scoutCode: initial.scoutCode || "",
  })
  const [loading, setLoading] = useState(true)
  const [prefillLoading, setPrefillLoading] = useState(false)
  const [panUploadLoading, setPanUploadLoading] = useState(false)
  const [panUploadError, setPanUploadError] = useState<string | null>(null)
  const [panUploadSuccess, setPanUploadSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [scoutCodes, setScoutCodes] = useState<ScoutCode[]>([])
  const [scoutCodesLoading, setScoutCodesLoading] = useState(false)
  const [selectedScoutCode, setSelectedScoutCode] = useState<string>("")
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)

  // Load existing doctor details on component mount
  useEffect(() => {
    const loadDoctorDetails = async () => {
      try {
        // Get doctor details by phone number (no doctorId needed)
        const response = await getDoctorDetailsByPhoneNumber(initial.phone)
        if (response.status === 200 && response.data) {
          const data = response.data
          setForm({
            phone: data.phoneNumber || initial.phone || "",
            fullName: data.name || "",
            pan: data.pan || "",
            email: data.emailId || "",
            dob: data.dob ? parseDateFromAPIResponse(data.dob) : "", // Parse date from API response
            scoutCode: data.scoutCode || "",
          })
          
          // Set selected scout code if scout code exists
          if (data.scoutCode) {
            setSelectedScoutCode(data.scoutCode)
          }
          console.log("Doctor details loaded:", data)
          
          // Store doctorId in localStorage if we get it from the response
          if (data.doctorId) {
            localStorage.setItem('doctorId', data.doctorId)
          }
        }

        // Load existing PAN card document
        const doctorId = localStorage.getItem('doctorId')
        if (doctorId) {
          try {
            const documentsResponse = await getDocumentsByDoctorId(doctorId)
            if (documentsResponse.status === 200 && documentsResponse.data?.panCardUrl) {
              setUploadedFileUrl(documentsResponse.data.panCardUrl)
              console.log("PAN card document loaded:", documentsResponse.data.panCardUrl)
            }
          } catch (error) {
            console.error("Error loading PAN card document:", error)
          }
        }
      } catch (error) {
        console.error("Error loading doctor details:", error)
        // Continue with initial form data if error
      } finally {
        setLoading(false)
      }
    }

    loadDoctorDetails()
  }, [initial.phone])

  // Load scout codes on component mount
  useEffect(() => {
    loadScoutCodes()
  }, [])

  const update = (k: keyof Data, v: string) => setForm((f) => ({ ...f, [k]: v }))

  // Load scout codes
  const loadScoutCodes = async () => {
    try {
      setScoutCodesLoading(true)
      const response = await getAllScoutCodes()
      
      if (response.status === 200 && response.data) {
        setScoutCodes(response.data)
        console.log("Scout codes loaded:", response.data)
      }
    } catch (error) {
      console.error("Error loading scout codes:", error)
      // Don't show error to user as this is optional functionality
    } finally {
      setScoutCodesLoading(false)
    }
  }

  // Handle PAN card upload and OCR
  const handlePanCardUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setPanUploadError('Please upload a valid image (JPEG, PNG) or PDF file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPanUploadError('File size should be less than 5MB')
      return
    }

    try {
      setPanUploadLoading(true)
      setPanUploadError(null)
      setPanUploadSuccess(null)

      // Get doctorId from localStorage
      const doctorId = localStorage.getItem('doctorId')
      if (!doctorId) {
        throw new Error('Doctor ID not found. Please complete the previous steps.')
      }

      // Step 1: Upload PAN card file using /uploadpdf
      const uploadResponse = await uploadPdf(file, 'panCard', file.type === 'application/pdf' ? 'pdf' : 'img', doctorId)
      
      if (uploadResponse.status !== 200) {
        throw new Error(uploadResponse.message || 'Failed to upload PAN card file')
      }

      console.log('File uploaded successfully. URL:', uploadResponse.data)
      
      // Store the uploaded file URL for preview
      setUploadedFileUrl(uploadResponse.data)

      // Step 2: Process OCR using /ocr/pan-card/
      const ocrResponse = await processPanCardOCR(file)
      
      if (ocrResponse.success && ocrResponse.data) {
        const extractedPan = ocrResponse.data.pan_card_number.toUpperCase()
        
        // Check if PAN field already has a value
        if (form.pan && form.pan.trim() !== '') {
          // Compare existing PAN with extracted PAN
          if (form.pan.toUpperCase() === extractedPan) {
            setPanUploadSuccess('PAN card uploaded and processed successfully! PAN number matches the existing entry.')
          } else {
            setPanUploadError(`PAN number mismatch! Existing: ${form.pan}, Extracted: ${extractedPan}`)
          }
        } else {
          // Auto-fill PAN field with extracted data
          setForm(prevForm => ({ ...prevForm, pan: extractedPan }))
          setPanUploadSuccess(`PAN card uploaded and processed successfully! PAN number auto-filled: ${extractedPan}`)
        }

        // Also auto-fill name and DOB if available and fields are empty
        if (ocrResponse.data.person_name && !form.fullName) {
          setForm(prevForm => ({ ...prevForm, fullName: ocrResponse.data.person_name }))
        }
        
        if (ocrResponse.data.date_of_birth && !form.dob) {
          const formattedDob = parseDateFromAPIResponse(ocrResponse.data.date_of_birth)
          if (formattedDob) {
            setForm(prevForm => ({ ...prevForm, dob: formattedDob }))
          }
        }
      } else {
        throw new Error(ocrResponse.message || 'Failed to process PAN card OCR')
      }
    } catch (error) {
      console.error('Error uploading PAN card:', error)
      setPanUploadError(error instanceof Error ? error.message : 'Failed to upload PAN card. Please try again.')
    } finally {
      setPanUploadLoading(false)
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Handle scout code selection
  const handleScoutCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value
    setSelectedScoutCode(selectedCode)
    
    // Find the selected scout and update the form with the scout code
    const selectedScout = scoutCodes.find(scout => scout.code === selectedCode)
    if (selectedScout) {
      setForm(prevForm => ({ ...prevForm, scoutCode: selectedScout.code }))
    }
  }

  // Debounced function to call phone prefill API
  const debouncedPhonePrefill = useCallback(
    debounce(async (phone: string, firstName: string) => {
      if (!phone || !firstName || phone.length !== 10 || firstName.length < 2) {
        return
      }

      try {
        setPrefillLoading(true)
        const response = await getPhonePrefillData({
          phone_number: phone,
          first_name: firstName
        })

        if (response.success && response.data.data_available && response.data.extracted_data) {
          const extractedData = response.data.extracted_data
          
          // Auto-fill fields if they are empty
          setForm(prevForm => ({
            ...prevForm,
            pan: prevForm.pan || extractedData.pan || "",
            email: prevForm.email || (extractedData.emails && extractedData.emails.length > 0 ? extractedData.emails[0] : "") || "",
            dob: prevForm.dob || parseDateFromAPIResponse(extractedData.dob) || ""
          }))
          
          console.log("Phone prefill data loaded:", extractedData)
        }
      } catch (error) {
        console.error("Error fetching phone prefill data:", error)
        // Don't show error to user as this is optional functionality
      } finally {
        setPrefillLoading(false)
      }
    }, 1000), // 1 second debounce
    []
  )

  // Effect to trigger phone prefill when name or phone changes
  useEffect(() => {
    if (form.phone && form.fullName && !loading) {
      const firstName = form.fullName.split(' ')[0]
      debouncedPhonePrefill(form.phone, firstName)
    }
  }, [form.phone, form.fullName, debouncedPhonePrefill, loading])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Get doctorId from localStorage
      const doctorId = localStorage.getItem('doctorId')
      
      // Prepare data for API
      const doctorData = {
        id: "",
        doctorId: doctorId || undefined, // Add doctorId to update existing record
        phoneNumber: form.phone,
        name: form.fullName,
        pan: form.pan,
        emailId: form.email,
        dob: formatDateForAPI(form.dob), // Convert to DD-MM-YYYY format for API
        scoutCode: form.scoutCode || "",
        joiningDate: new Date().toISOString().split('T')[0], // Today's date
      }

      // Save doctor details
      const response = await saveOrUpdateDoctorDetails(doctorData)
      
      if (response.status === 200 && response.data) {
        // Store the doctorId if it's a new doctor
        if (!doctorId && response.data.doctorId) {
          localStorage.setItem('doctorId', response.data.doctorId)
        }
        
        // Save PAN and phone number to localStorage for use in PracticeDetails
        if (form.pan) {
          localStorage.setItem('savedPan', form.pan)
        }
        if (form.phone) {
          localStorage.setItem('phoneNumber', form.phone)
        }
        
        console.log("Doctor details saved successfully:", response.data)
        onNext(form)
      } else if (response.status === 403) {
        // Handle existing user case - this is actually success
        console.log("User already exists, proceeding to next step")
        
        // Save PAN and phone number to localStorage for use in PracticeDetails
        if (form.pan) {
          localStorage.setItem('savedPan', form.pan)
        }
        if (form.phone) {
          localStorage.setItem('phoneNumber', form.phone)
        }
        
        onNext(form)
      } else {
        console.error("API Error - Status:", response.status, "Message:", response.message, "Data:", response.data)
        setError(`Failed to save doctor details. Status: ${response.status}, Message: ${response.message}`)
      }
    } catch (error) {
      console.error("Error saving doctor details:", error)
      setError("Error saving doctor details. Please check your connection and try again.")
    }
  }

  if (loading) {
    return (
      <section className="card card--padded">
        <div className="loading">Loading personal details...</div>
      </section>
    )
  }

  return (
    <section className="card card--padded">
      <img src="/images/personal-details.png" alt="" className="sr-only" />
      <h2 className="title">Personal details</h2>

      {/* Error Message Display */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #f5c6cb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#721c24',
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
      <form onSubmit={submit} className="form">
        <label className="label">Phone Number</label>
        <input 
          className="input" 
          value={form.phone} 
          onChange={(e) => update("phone", e.target.value)}
          disabled
          style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
        />

        <label className="label">Full name</label>
        <input className="input" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
        {prefillLoading && (
          <div className="prefill-indicator" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            🔍 Looking up details...
          </div>
        )}

        <label className="label">Upload PAN Card</label>
        <div style={{ marginBottom: '16px' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handlePanCardUpload}
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
            disabled={panUploadLoading}
          />
          {panUploadLoading && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              🔄 Processing PAN card...
            </div>
          )}
          {panUploadError && (
            <div style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px' }}>
              ❌ {panUploadError}
            </div>
          )}
          {panUploadSuccess && (
            <div style={{ fontSize: '12px', color: '#27ae60', marginTop: '4px' }}>
              ✅ {panUploadSuccess}
            </div>
          )}
        </div>

        {/* File Preview */}
        {uploadedFileUrl && (
          <div style={{ marginTop: '16px', marginBottom: '16px' }}>
            <label className="label">Uploaded Document Preview</label>
            <div style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              padding: '16px',
              backgroundColor: '#f9f9f9',
              textAlign: 'center'
            }}>
              {uploadedFileUrl.toLowerCase().includes('.pdf') ? (
                <div>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>📄</div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                    PDF Document Uploaded
                  </div>
                  <a 
                    href={uploadedFileUrl} 
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
                    src={uploadedFileUrl} 
                    alt="Uploaded document preview" 
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
                        <div style="font-size: 14px; color: #666;">Image Preview</div>
                        <a href="${uploadedFileUrl}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: none; font-size: 12px;">View Image →</a>
                      `;
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <label className="label">PAN Number</label>
        <input 
          className="input" 
          value={form.pan} 
          onChange={(e) => update("pan", e.target.value.toUpperCase())} 
          placeholder="Enter PAN number or upload PAN card above"
        />

        <label className="label">Email</label>
        <input type="email" className="input" value={form.email} onChange={(e) => update("email", e.target.value)} />

        <label className="label">Date of birth</label>
        <input type="date" className="input" value={form.dob} onChange={(e) => update("dob", e.target.value)} />

        <label className="label">Scout Name (optional)</label>
        <select 
          className="input" 
          value={selectedScoutCode} 
          onChange={handleScoutCodeChange}
          disabled={scoutCodesLoading}
        >
          <option value="">Select a scout</option>
          {scoutCodes.map((scout) => (
            <option key={scout.code} value={scout.code}>
              {scout.name}
            </option>
          ))}
        </select>
        {scoutCodesLoading && (
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            🔄 Loading scout codes...
          </div>
        )}

        <button className="btn btn--primary" type="submit">
          Next
        </button>
      </form>
    </section>
  )
}
