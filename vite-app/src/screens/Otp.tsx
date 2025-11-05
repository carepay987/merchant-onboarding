"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { verifyOtp, validateOtp, getDoctorDetailsByPhoneNumber, saveOrUpdateDoctorDetails } from "../services/api"

type Props = {
  phone: string
  onChangeNumber: () => void
  onVerify: (otp: string, doctorId?: string) => void
}

export default function OtpScreen({ phone, onChangeNumber, onVerify }: Props) {
  const length = 4
  const [values, setValues] = useState<string[]>(Array.from({ length }, () => ""))
  const [error, setError] = useState<string | null>(null)
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  const handleChange = (i: number, v: string) => {
    const digit = v.replace(/\D/g, "").slice(-1)
    const next = [...values]
    next[i] = digit ?? ""
    setValues(next)
    if (digit && i < length - 1) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null) // Clear any existing errors
    const otp = values.join("")
    if (otp.length !== length) {
      setError("Please enter the 4-digit OTP")
      return
    }
    
    if (!validateOtp(otp)) {
      setError("Please enter a valid OTP")
      return
    }

    try {
      const response = await verifyOtp(phone, otp)
      if (response.status === 200) {
        console.log("OTP verification successful:", response.data)
        
        // After OTP verification, create/update doctor record
        try {
          // Convert date from YYYY-MM-DD to DD-MM-YYYY format
          const formatDateToDDMMYYYY = (dateString: string) => {
            if (!dateString) return ""
            const [year, month, day] = dateString.split('-')
            return `${day}-${month}-${year}`
          }

          // Prepare basic doctor data for saveOrUpdateDoctorDetails
          const doctorData = {
            phoneNumber: phone,
            name: "", // Will be filled in Personal Details step
            pan: "",
            emailId: "",
            dob: "",
            scoutCode: "",
            joiningDate: formatDateToDDMMYYYY(new Date().toISOString().split('T')[0]), // Today's date in DD-MM-YYYY format
            doctorCode: "",
            creatorId: "",
            important: "",
            appDownloadStatus: "",
            verified: "true", // Mark as verified after OTP
            mobileVerified: "true" // Mark mobile as verified
          }

          console.log("Creating/updating doctor record with data:", doctorData)
          
          // Call saveOrUpdateDoctorDetails API
          const doctorResponse = await saveOrUpdateDoctorDetails(doctorData)
          
          if (doctorResponse.status === 200 && doctorResponse.data) {
            // Store the doctorId from the response
            const doctorId = doctorResponse.data.doctorId
            localStorage.setItem('doctorId', doctorId)
            console.log("Doctor record created/updated successfully, doctorId stored:", doctorId)
            onVerify(otp, doctorId)
          } else if (doctorResponse.status === 403) {
            // Handle existing user case - this is actually success
            console.log("Doctor already exists, proceeding to next step")
            
            // Try to get the existing doctor's ID
            try {
              const existingDoctorResponse = await getDoctorDetailsByPhoneNumber(phone)
              if (existingDoctorResponse.status === 200 && existingDoctorResponse.data?.doctorId) {
                const doctorId = existingDoctorResponse.data.doctorId
                localStorage.setItem('doctorId', doctorId)
                console.log("Existing doctor found, doctorId stored:", doctorId)
                onVerify(otp, doctorId)
              } else {
                onVerify(otp)
              }
            } catch (existingError) {
              console.error("Error getting existing doctor details:", existingError)
              onVerify(otp)
            }
          } else {
            console.error("Failed to create/update doctor record:", doctorResponse)
            setError("Failed to create doctor record. Please try again.")
          }
        } catch (doctorError) {
          console.error("Error creating/updating doctor record:", doctorError)
          setError("Error creating doctor record. Please try again.")
        }
      } else {
        setError("Invalid OTP. Please try again.")
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      setError("Error verifying OTP. Please check your connection and try again.")
    }
  }

  return (
    <section className="card card--padded">
      <img src="/images/verify-otp.png" alt="" className="sr-only" />
      <h2 className="title">Verify OTP</h2>
      <p className="muted">Enter the OTP sent to</p>
      <div className="row row--spread">
        <strong>+91 {phone}</strong>
        <button className="link" type="button" onClick={onChangeNumber}>
          Change Number
        </button>
      </div>

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
        <div className="otp-grid" aria-label="One-time password input">
          {values.map((val, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              className="input input--otp"
              inputMode="numeric"
              pattern="\d*"
              maxLength={1}
              value={val}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              aria-label={`OTP digit ${i + 1}`}
            />
          ))}
        </div>
        <button className="btn btn--primary" type="submit">
          Submit
        </button>
      </form>
    </section>
  )
}
