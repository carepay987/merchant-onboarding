"use client"

import type React from "react"
import { useState } from "react"

type Props = {
  initialPhone?: string
  onSendOtp: (phone: string) => void
}

export default function PhoneNumberScreen({ initialPhone = "", onSendOtp }: Props) {
  const [phone, setPhone] = useState(initialPhone)
  const [error, setError] = useState<string | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null) // Clear any existing errors
    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a valid 10-digit phone number")
      return
    }
    onSendOtp(phone)
  }

  return (
    <section className="card card--padded">
      <img src="/images/signup-hero.png" alt="CarePay signup illustration" className="hero-img" />
      <h2 className="title">Sign up</h2>
      
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
        <label className="label" htmlFor="phone">
          Mobile Number
        </label>
        <div className="input-row">
          <span className="prefix">+91</span>
          <input
            id="phone"
            inputMode="numeric"
            pattern="\d*"
            maxLength={10}
            className="input input--grow"
            placeholder="8989898989"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            aria-label="Mobile Number"
          />
        </div>

        <button className="btn btn--primary" type="submit">
          Send OTP
        </button>
      </form>
    </section>
  )
}
