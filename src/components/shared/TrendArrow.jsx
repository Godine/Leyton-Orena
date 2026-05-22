import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

export default function TrendArrow({ direction = 'flat', size = 14, className = '' }) {
  if (direction === 'up') {
    return <ArrowUpRight size={size} className={['text-accent-green', className].join(' ')} strokeWidth={2.6} />
  }
  if (direction === 'down') {
    return <ArrowDownRight size={size} className={['text-accent-coral', className].join(' ')} strokeWidth={2.6} />
  }
  return <Minus size={size} className={['text-arena-muted', className].join(' ')} strokeWidth={2.6} />
}
