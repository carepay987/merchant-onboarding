"use client"

import { useMemo, useState } from "react"
import { ProgressBar } from "./components/progress-bar"
import PhoneNumberScreen from "./screens/PhoneNumber"
import OtpScreen from "./screens/Otp"
import PersonalDetails from "./screens/PersonalDetails"
import PracticeDetails from "./screens/PracticeDetails"
import AddressScreen from "./screens/Address"
import OnlineFootprint from "./screens/OnlineFootprint"
import BankDetails from "./screens/BankDetails"
import ContractSigning from "./screens/ContractSigning"
import { sendOtp, verifyOtp, validatePhoneNumber, validateOtp } from "./services/api"

type AllData = {
  phone?: string
  otp?: string
  personal?: any
  practice?: any
  address?: any
  onlineFootprint?: any
  bank?: any
  contract?: any
}

export default function App() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<AllData>({})
  const [error, setError] = useState<string | null>(null)

  const total = 8
  const header = useMemo(() => {
    const titles = [
      "Get Started",
      "Verify Your Phone",
      "Personal Information",
      "Practice Information",
      "Address Details",
      "Online Footprint & Doctor Details",
      "Banking Information",
      "Contract & Agreement",
    ]
    return titles[step]
  }, [step])

  const go = (n: number) => setStep(n)
  const next = () => setStep((s) => Math.min(s + 1, total - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <main className="app">
      {/* Black header section - only show on step 0 */}
      {step === 0 && (
        <section className="hero-section">
          <div className="hero-content">
            <div className="brand">
              <img src="/images/carepay-logo.webp" alt="CarePay" className="brand__logo" />
            </div>
            
            <section className="card card--padded">
              <img src="/images/hero-image.png" alt="CarePay signup illustration" className="hero-img" />
              <h2 className="title">Welcome to CarePay</h2>
              <p className="muted" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                Complete your onboarding in just a few simple steps
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
              
              <form className="form">
                <label className="label" htmlFor="phone">Mobile Number</label>
                <div className="input-row">
                  <span className="prefix">+91</span>
                  <input 
                    id="phone" 
                    inputMode="numeric" 
                    pattern="\d*" 
                    maxLength={10} 
                    className="input input--grow" 
                    placeholder="9898989898" 
                    aria-label="Mobile Number" 
                    value={data.phone || ""}
                    onChange={(e) => setData(d => ({ ...d, phone: e.target.value }))}
                  />
                </div>
              <button 
                className="btn btn--primary" 
                type="submit"
                onClick={async (e) => {
                  e.preventDefault();
                  setError(null); // Clear any existing errors
                  if (data.phone && validatePhoneNumber(data.phone)) {
                    try {
                      const response = await sendOtp(data.phone);
                      if (response.status === 200) {
                        next();
                      } else {
                        setError('Failed to send OTP. Please try again.');
                      }
                    } catch (error) {
                      console.error('Error sending OTP:', error);
                      setError('Error sending OTP. Please check your connection and try again.');
                    }
                  } else {
                    setError('Please enter a valid 10-digit phone number.');
                  }
                }}
              >
                Send OTP →
              </button>
              </form>
            </section>
          </div>
        </section>
      )}

      {/* Main content area - show for all other steps */}
      {step > 0 && (
        <div className="main-content">
          <div className="container">
            <ProgressBar step={step} total={total} />
            <h1 className="page-title">{header}</h1>

        {step === 1 && (
          <OtpScreen
            phone={data.phone || ""}
            onChangeNumber={() => go(0)}
            onVerify={(otp, doctorId) => {
              setData((d) => ({ ...d, otp }))
              if (doctorId) {
                // Doctor exists, store doctorId in localStorage
                localStorage.setItem('doctorId', doctorId)
              }
              next()
            }}
          />
        )}

            {step === 2 && (
              <PersonalDetails
                initial={{ phone: data.phone || "" }}
                onNext={(personal) => {
                  setData((d) => ({ ...d, personal }))
                  next()
                }}
              />
            )}

            {step === 3 && (
              <PracticeDetails
                onBack={back}
                onNext={(practice) => {
                  setData((d) => ({ ...d, practice }))
                  next()
                }}
              />
            )}

            {step === 4 && (
              <AddressScreen
                onBack={back}
                onNext={(address) => {
                  setData((d) => ({ ...d, address }))
                  next()
                }}
              />
            )}

            {step === 5 && (
              <OnlineFootprint
                onBack={back}
                onNext={(onlineFootprint) => {
                  setData((d) => ({ ...d, onlineFootprint }))
                  next()
                }}
              />
            )}

            {step === 6 && (
              <BankDetails
                onBack={back}
                onSubmitAll={(bank) => {
                  setData((d) => ({ ...d, bank }))
                  next()
                }}
              />
            )}

            {step === 7 && (
              <ContractSigning
                onBack={back}
                onComplete={() => {
                  const payload = { ...data, contract: { signed: true } }
                  console.log("[v0] Collected form data:", payload)
                  // Show success message
                  alert("🎉 Congratulations! Your onboarding is complete. Contract signing completed successfully!")
                }}
              />
            )}
          </div>
        </div>
      )}
    </main>
  )
}
