"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getAddressDetails, saveOrUpdateAddressDetails } from "../services/api"

type Data = {
  address1: string
  address2: string
  city: string
  state: string
  pincode: string
}

type Props = {
  initial?: Partial<Data>
  onNext: (data: Data) => void
  onBack: () => void
}

export default function AddressScreen({ initial, onNext, onBack }: Props) {
  const [form, setForm] = useState<Data>({
    address1: initial?.address1 || "",
    address2: initial?.address2 || "",
    city: initial?.city || "",
    state: initial?.state || "",
    pincode: initial?.pincode || "",
  })
  const [loading, setLoading] = useState(true)
  const [gstAutoFilled, setGstAutoFilled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing address details on component mount
  useEffect(() => {
    const loadAddressDetails = async () => {
      try {
        const doctorId = localStorage.getItem('doctorId')
        let addressData = null

        // First, try to load from GST data if available
        const gstAddressData = localStorage.getItem('gstAddressData')
        if (gstAddressData) {
          try {
            addressData = JSON.parse(gstAddressData)
            setGstAutoFilled(true)
            console.log("GST address data found:", addressData)
          } catch (error) {
            console.error("Error parsing GST address data:", error)
          }
        }

        // If no GST data, try to load from API
        if (!addressData && doctorId) {
          const response = await getAddressDetails(doctorId)
          if (response.status === 200 && response.data) {
            const data = response.data
            addressData = {
              building: data.building || "",
              locality: data.locality || "",
              city: data.city || "",
              state: data.state || "",
              pincode: data.pinCode || "",
            }
            console.log("Address details loaded from API:", data)
          }
        }

        // Set form data if we have any address data
        if (addressData) {
          setForm({
            address1: addressData.building || "",
            address2: addressData.locality || "",
            city: addressData.city || "",
            state: addressData.state || "",
            pincode: addressData.pincode || "",
          })
        }
      } catch (error) {
        console.error("Error loading address details:", error)
        // Continue with empty form if error
      } finally {
        setLoading(false)
      }
    }

    loadAddressDetails()
  }, [])

  const update = (k: keyof Data, v: string) => setForm((f) => ({ ...f, [k]: v }))
  
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!form.address1.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
      setError("Please fill in all required fields (Address line 1, City, State, and Pincode).")
      return
    }

    // Validate pincode format
    if (!/^\d{6}$/.test(form.pincode)) {
      setError("Please enter a valid 6-digit pincode.")
      return
    }
    
    try {
      const doctorId = localStorage.getItem('doctorId')
      if (!doctorId) {
        setError("Doctor ID not found. Please try again.")
        return
      }

      // Prepare data for API
      const addressData = {
        id: "",
        doctorId: doctorId,
        building: form.address1,
        locality: form.address2,
        pinCode: form.pincode,
        city: form.city,
        state: form.state
      }

      console.log("Sending address data:", addressData)

      // Save address details
      const response = await saveOrUpdateAddressDetails(addressData)
      
      console.log("Address API response:", response)
      
      if (response.status === 200) {
        console.log("Address details saved successfully:", response.data)
        // Clear GST address data after successful save
        localStorage.removeItem('gstAddressData')
        onNext(form)
      } else if (response.status === 403) {
        // Handle existing user case - this might be success
        console.log("Address already exists, proceeding to next step")
        localStorage.removeItem('gstAddressData')
        onNext(form)
      } else {
        console.error("Address save failed - Status:", response.status, "Response:", response)
        setError(`Failed to save address details. Status: ${response.status}, Message: ${response.message || 'Unknown error'}. Please try again.`)
      }
    } catch (error) {
      console.error("Error saving address details:", error)
      setError("Error saving address details. Please check your connection and try again.")
    }
  }

  if (loading) {
    return (
      <section className="card card--padded">
        <div className="loading">Loading address details...</div>
      </section>
    )
  }

  return (
    <section className="card card--padded">
      <h2 className="title">Address</h2>
      
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

      {gstAutoFilled && (
        <div className="gst-auto-fill-notice" style={{ 
          fontSize: '12px', 
          color: '#28a745', 
          marginBottom: '16px',
          padding: '8px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #28a745'
        }}>
          ✅ Address details auto-filled from GST information
        </div>
      )}
      <form onSubmit={submit} className="form">
        <label className="label">Address line 1</label>
        <input className="input" value={form.address1} onChange={(e) => update("address1", e.target.value)} />

        <label className="label">Address line 2</label>
        <input className="input" value={form.address2} onChange={(e) => update("address2", e.target.value)} />

        <label className="label">City</label>
        <input className="input" value={form.city} onChange={(e) => update("city", e.target.value)} />

        <label className="label">State</label>
        <input className="input" value={form.state} onChange={(e) => update("state", e.target.value)} />

        <label className="label">Pincode</label>
        <input
          inputMode="numeric"
          className="input"
          value={form.pincode}
          onChange={(e) => update("pincode", e.target.value.replace(/\D/g, ""))}
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
