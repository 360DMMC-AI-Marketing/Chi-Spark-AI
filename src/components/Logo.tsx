import sparkMark from '../assets/spark-mark.png'

export function Logo({ dark = false, className = '' }: { dark?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img src={sparkMark} alt="Chi-Spark AI mark" className="h-8 w-auto" />
      <span className={`text-lg font-bold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>
        Chi-<span className="font-serif-italic text-spark">Spark</span> AI
      </span>
    </span>
  )
}
