import sparkMark from '../assets/spark-mark.png'

type Variant = 'onLight' | 'onSky' | 'onDark'

const TEXT_CLASS: Record<Variant, string> = {
  onLight: 'text-fg',
  onSky: 'text-sky',
  onDark: 'text-white',
}

export function Logo({ variant = 'onLight', className = '' }: { variant?: Variant; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img src={sparkMark} alt="Chi-Spark AI mark" className="h-8 w-auto" />
      <span className={`text-lg font-bold tracking-tight ${TEXT_CLASS[variant]}`}>
        Chi-<span className="font-serif-italic text-spark">Spark</span> AI
      </span>
    </span>
  )
}
