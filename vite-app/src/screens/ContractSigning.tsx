"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { initiateContract, ContractDetails } from "../services/api"

type Props = {
  onBack: () => void
  onComplete: () => void
}

export default function ContractSigning({ onBack, onComplete }: Props) {
  const [loading, setLoading] = useState(true)
  const [contractData, setContractData] = useState<ContractDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load contract data on component mount
  useEffect(() => {
    const loadContract = async () => {
      try {
        const doctorId = localStorage.getItem('doctorId')
        if (!doctorId) {
          setError("Doctor ID not found. Please try again.")
          setLoading(false)
          return
        }

        const response = await initiateContract(doctorId)
        if (response.status === 200 && response.data) {
          setContractData(response.data)
          console.log("Contract data loaded:", response.data)
        } else {
          setError("Failed to load contract. Please try again.")
        }
      } catch (error) {
        console.error("Error loading contract:", error)
        setError("Error loading contract. Please check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }

    loadContract()
  }, [])

  const handleCompleteSigning = () => {
    if (contractData?.esignUrl) {
      // Redirect to the e-sign URL
      window.open(contractData.esignUrl, '_blank')
      // Call onComplete to proceed to next step
      onComplete()
    } else {
      setError("E-sign URL not available. Please try again.")
    }
  }

  if (loading) {
    return (
      <section className="card card--padded">
        <div className="loading">Loading contract...</div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="card card--padded">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 className="title" style={{ color: '#dc3545', marginBottom: '1rem' }}>Error</h2>
          <p style={{ marginBottom: '2rem', color: '#666' }}>{error}</p>
          <div className="row">
            <button className="btn btn--ghost" onClick={onBack}>
              Back
            </button>
            <button className="btn btn--primary" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (!contractData) {
    return (
      <section className="card card--padded">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 className="title" style={{ color: '#dc3545', marginBottom: '1rem' }}>No Contract Found</h2>
          <p style={{ marginBottom: '2rem', color: '#666' }}>No contract data available.</p>
          <div className="row">
            <button className="btn btn--ghost" onClick={onBack}>
              Back
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="card card--padded">
      <button className="link link--back" type="button" onClick={onBack} aria-label="Back" style={{ marginBottom: '1rem' }}>
        ← Back
      </button>
      <h2 className="title">Contract & Agreement</h2>
      <p className="muted" style={{ marginBottom: '1.5rem' }}>
        Please review and sign the contract to complete your onboarding
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

      {/* PDF Viewer Container */}
      <div style={{
        border: '2px solid var(--border-color)',
        borderRadius: 'var(--border-radius-lg)',
        backgroundColor: 'var(--bg-secondary)',
        marginBottom: '2rem',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)'
      }}>
        {/* PDF Content Area */}
        <div style={{
          backgroundColor: 'white',
          minHeight: '500px',
          padding: '1rem',
          position: 'relative'
        }}>
          {contractData.pdfUrl ? (
            <iframe
              src={contractData.pdfUrl}
              style={{
                width: '100%',
                height: '500px',
                border: 'none',
                borderRadius: '4px'
              }}
              title="Contract PDF"
            />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '500px',
              color: '#666',
              fontSize: '1.1rem'
            }}>
              PDF not available
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="row">
        <button className="btn btn--ghost" onClick={onBack}>
          Back
        </button>
        <button 
          className="btn btn--primary" 
          onClick={handleCompleteSigning}
        >
          Complete Signing →
        </button>
      </div>
    </section>
  )
}
