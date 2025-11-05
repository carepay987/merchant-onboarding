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

      {/* PDF Viewer Container */}
      <div style={{
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa',
        marginBottom: '2rem',
        overflow: 'hidden'
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
          style={{
            backgroundColor: '#4a5568',
            color: 'white',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#2d3748'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#4a5568'
          }}
        >
          Complete signing
        </button>
      </div>
    </section>
  )
}
