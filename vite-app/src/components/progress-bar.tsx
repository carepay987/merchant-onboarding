type Props = {
  step: number
  total: number
}

export function ProgressBar({ step, total }: Props) {
  const pct = Math.round(((step + 1) / total) * 100)
  const steps = [
    "Phone",
    "OTP",
    "Personal",
    "Practice",
    "Address",
    "Footprint",
    "Bank",
    "Contract"
  ]
  
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className="progress__bar" style={{ width: `${pct}%` }} />
      </div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: '0.5rem',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        fontWeight: 500
      }}>
        {steps.map((label, idx) => (
          <span 
            key={idx}
            style={{ 
              color: idx <= step ? 'var(--primary-600)' : 'var(--text-muted)',
              transition: 'color 0.3s ease'
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
