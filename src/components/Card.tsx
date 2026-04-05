import { WikiCard } from '@/types/game'

interface CardProps {
  card: WikiCard
  hidden?: boolean
  faceDown?: boolean
  clickable?: boolean
  selected?: boolean
  variant?: 'player' | 'cpu'
  small?: boolean
  onClick?: () => void
}

export default function Card({
  card,
  hidden = false,
  faceDown = false,
  clickable = false,
  selected = false,
  variant = 'player',
  small = false,
  onClick,
}: CardProps) {
  const sizeClass = small ? 'w-20 h-28' : 'w-28 h-40'

  const getPowerColor = (power: number) => {
    if (power >= 100000) return 'text-red-800'
    if (power >= 50000) return 'text-red-500'
    if (power >= 10000) return 'text-orange-400'
    return 'text-yellow-300'
  }

  if (faceDown) {
    return (
      <div
        className={`${sizeClass} rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-600 flex items-center justify-center select-none shadow-lg`}
      >
        <span className="text-gray-500 text-3xl">🃏</span>
      </div>
    )
  }

  const gradients = {
    player: 'from-blue-700 to-blue-950',
    cpu: 'from-red-700 to-red-950',
  }
  const borders = {
    player: selected ? 'border-yellow-400' : clickable ? 'border-blue-400' : 'border-blue-700',
    cpu: selected ? 'border-yellow-400' : 'border-red-700',
  }
  const dividers = {
    player: 'border-blue-600',
    cpu: 'border-red-600',
  }
  const powerLabels = {
    player: 'text-blue-300',
    cpu: 'text-red-300',
  }

  return (
    <div
      className={`
        ${sizeClass} rounded-lg border-2 flex flex-col p-2 text-white select-none shadow-lg
        bg-gradient-to-br ${gradients[variant]}
        ${borders[variant]}
        ${selected ? 'ring-2 ring-yellow-400 scale-110 z-10' : ''}
        ${clickable ? 'cursor-pointer hover:brightness-125 hover:scale-105 hover:shadow-xl active:scale-95 transition-transform duration-100' : ''}
      `}
      onClick={clickable && onClick ? onClick : undefined}
    >
      <div className="flex-1 overflow-hidden">
        <p className={`font-medium leading-tight ${small ? 'text-[10px] line-clamp-3' : 'text-xs line-clamp-4'}`}>
          {card.title}
        </p>
      </div>
      <div className={`mt-1 border-t ${dividers[variant]} pt-1 text-center`}>
        <p className={`${powerLabels[variant]} ${small ? 'text-[9px]' : 'text-[10px]'} font-medium`}>
          POWER
        </p>
        <p className={`font-bold ${small ? 'text-sm' : 'text-base'} ${hidden ? 'text-gray-400 tracking-widest' : getPowerColor(card.power)}`}>
          {hidden ? '???' : card.power.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
