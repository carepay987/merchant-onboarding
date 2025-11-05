type Props = {
  step: number
  total: number
}

export function ProgressBar({ step, total }: Props) {
  const pct = Math.round(((step + 1) / total) * 100)
  return (
    <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
      <div className="progress__bar" style={{ width: `${pct}%` }} />
    </div>
  )
}
