"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getDoctorProfDetailsByDoctorId, saveOrUpdateDoctorProfessionalDetails } from "../services/api"

type Data = {
  licenceNumber: string
  googleReviewLink: string
  practoLink: string
  justDialLink: string
  instaHandle: string
  qualification: string
  experience: string
}

type Props = {
  initial?: Partial<Data>
  onNext: (data: Data) => void
  onBack: () => void
}

export default function OnlineFootprint({ initial, onNext, onBack }: Props) {
  const [form, setForm] = useState<Data>({
    licenceNumber: initial?.licenceNumber || "",
    googleReviewLink: initial?.googleReviewLink || "",
    practoLink: initial?.practoLink || "",
    justDialLink: initial?.justDialLink || "",
    instaHandle: initial?.instaHandle || "",
    qualification: initial?.qualification || "",
    experience: initial?.experience || "",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load existing professional details on component mount
  useEffect(() => {
    const loadProfessionalDetails = async () => {
      try {
        const doctorId = localStorage.getItem('doctorId')
        if (doctorId) {
          const response = await getDoctorProfDetailsByDoctorId(doctorId)
          if (response.status === 200 && response.data) {
            const data = response.data
            setForm({
              licenceNumber: data.licenceNumber || "",
              googleReviewLink: data.googleReviewLink || "",
              practoLink: data.practoLink || "",
              justDialLink: data.justDialLink || "",
              instaHandle: data.instaHandle || "",
              qualification: data.qualification || "",
              experience: data.experience || "",
            })
            console.log("Professional details loaded:", data)
          }
        }
      } catch (error) {
        console.error("Error loading professional details:", error)
        // Continue with empty form if error
      } finally {
        setLoading(false)
      }
    }

    loadProfessionalDetails()
  }, [])

  const update = (k: keyof Data, v: string) => setForm((f) => ({ ...f, [k]: v }))

  // URL validation helper
  const isValidUrl = (url: string): boolean => {
    if (!url) return true // Empty URLs are allowed (optional fields)
    try {
      new URL(url)
      return true
    } catch {
      // Check if it's a valid URL format (http://, https://, or just domain)
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
      return urlPattern.test(url)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate URLs if provided
    if (form.googleReviewLink && !isValidUrl(form.googleReviewLink)) {
      setError("Please enter a valid Google Review Link URL.")
      return
    }
    if (form.practoLink && !isValidUrl(form.practoLink)) {
      setError("Please enter a valid Practo Link URL.")
      return
    }
    if (form.justDialLink && !isValidUrl(form.justDialLink)) {
      setError("Please enter a valid JustDial Link URL.")
      return
    }
    
    try {
      const doctorId = localStorage.getItem('doctorId')
      if (!doctorId) {
        setError("Doctor ID not found. Please try again.")
        return
      }

      // Get existing professional details to preserve other fields
      let existingData = null
      try {
        const existingResponse = await getDoctorProfDetailsByDoctorId(doctorId)
        if (existingResponse.status === 200 && existingResponse.data) {
          existingData = existingResponse.data
        }
      } catch (error) {
        console.error("Error fetching existing professional details:", error)
      }

      // Prepare data for API - merge with existing data to preserve other fields
      const professionalData = {
        id: existingData?.id?.toString() || "",
        doctorId: doctorId,
        licenceNumber: form.licenceNumber || existingData?.licenceNumber || "",
        clinicName: existingData?.clinicName || "",
        incorporationDate: existingData?.incorporationDate || "",
        businessEntityName: existingData?.businessEntityName || "",
        businessEntityType: existingData?.businessEntityType || "",
        cinLlpin: existingData?.cinLlpin || null,
        gstIn: existingData?.gstIn || "",
        speciality: existingData?.speciality || "",
        googleReviewLink: form.googleReviewLink || null,
        justdialReviewLink: existingData?.justdialReviewLink || null,
        experience: form.experience || null,
        justDialLink: form.justDialLink || null,
        practoLink: form.practoLink || null,
        instaHandle: form.instaHandle || null,
        qualification: form.qualification || null,
      }

      // Save professional details
      const response = await saveOrUpdateDoctorProfessionalDetails(professionalData)
      
      if (response.status === 200) {
        console.log("Professional details saved successfully:", response.data)
        onNext(form)
      } else {
        setError("Failed to save professional details. Please try again.")
      }
    } catch (error) {
      console.error("Error saving professional details:", error)
      setError("Error saving professional details. Please check your connection and try again.")
    }
  }

  if (loading) {
    return (
      <section className="card card--padded">
        <div className="loading">Loading professional details...</div>
      </section>
    )
  }

  return (
    <section className="card card--padded">
      <button className="link link--back" type="button" onClick={onBack} aria-label="Back">
        ← Back
      </button>
      <h2 className="title">Online Footprint & Doctor Details</h2>
      <p className="muted" style={{ marginBottom: '1.5rem' }}>
        Help us find you online and share your professional background
      </p>

      {/* Error Message Display */}
      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button 
            className="alert__close"
            onClick={() => setError(null)}
            aria-label="Close error message"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={submit} className="form">
        {/* Online Footprint Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Online Footprint
          </h3>
          
          <label className="label">Your website link</label>
          <input 
            className="input" 
            type="url"
            value={form.googleReviewLink} 
            onChange={(e) => update("googleReviewLink", e.target.value)} 
            placeholder="https://g.page/r/..."
          />

          <label className="label">Practo Link</label>
          <input 
            className="input" 
            type="url"
            value={form.practoLink} 
            onChange={(e) => update("practoLink", e.target.value)} 
            placeholder="https://www.practo.com/..."
          />

          <label className="label">JustDial Link</label>
          <input 
            className="input" 
            type="url"
            value={form.justDialLink} 
            onChange={(e) => update("justDialLink", e.target.value)} 
            placeholder="https://www.justdial.com/..."
          />

          <label className="label">Instagram Handle</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>@</span>
            <input 
              className="input" 
              value={form.instaHandle} 
              onChange={(e) => update("instaHandle", e.target.value.replace(/^@/, ''))} 
              placeholder="your_handle"
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Doctor Details Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Doctor Details
          </h3>
          
          <label className="label">Qualification</label>
          <input 
            className="input" 
            value={form.qualification} 
            onChange={(e) => update("qualification", e.target.value)} 
            placeholder="e.g., MBBS, MD, MS, etc."
          />

          <label className="label">Experience (in years)</label>
          <input 
            className="input" 
            type="number"
            min="0"
            value={form.experience} 
            onChange={(e) => update("experience", e.target.value)} 
            placeholder="Enter years of experience"
          />

          <label className="label">Medical Licence Number</label>
          <input 
            className="input" 
            value={form.licenceNumber} 
            onChange={(e) => update("licenceNumber", e.target.value)} 
            placeholder="Enter your medical licence number"
          />
        </div>

        <div className="row">
          <button className="btn btn--ghost" type="button" onClick={onBack}>
            Back
          </button>
          <button className="btn btn--primary" type="submit">
            Continue →
          </button>
        </div>
      </form>
    </section>
  )
}

