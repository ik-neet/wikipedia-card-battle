import { Difficulty } from '@/types/game'

interface Props {
  onSelect: (difficulty: Difficulty) => void
  onBack: () => void
}

const difficulties: {
  value: Difficulty
  label: string
  emoji: string
  description: string
  sub: string
  gradient: string
}[] = [
  {
    value: 'weak',
    label: '弱い',
    emoji: '🐣',
    description: 'CPUがランダムにカードを選ぶ',
    sub: '先攻・後攻ともにランダム選択',
    gradient: 'from-green-700 to-green-900 hover:from-green-600 hover:to-green-800',
  },
  {
    value: 'normal',
    label: '普通',
    emoji: '⚔️',
    description: 'CPUがある程度賢く動く',
    sub: '後攻時70%の確率で有利なカードを選択',
    gradient: 'from-yellow-700 to-yellow-900 hover:from-yellow-600 hover:to-yellow-800',
  },
  {
    value: 'strong',
    label: '強い',
    emoji: '👑',
    description: 'CPUが最適なカードを選ぶ',
    sub: '後攻時は常に勝てるカードを優先選択',
    gradient: 'from-red-700 to-red-900 hover:from-red-600 hover:to-red-800',
  },
]

export default function DifficultyScreen({ onSelect, onBack }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0a1628] to-[#0d2444] p-4">
      <h2 className="text-3xl font-bold text-white mb-2">CPU 難易度選択</h2>
      <p className="text-gray-400 mb-8 text-sm">対戦するCPUの強さを選んでください</p>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        {difficulties.map(d => (
          <button
            key={d.value}
            onClick={() => onSelect(d.value)}
            className={`p-5 rounded-xl bg-gradient-to-r ${d.gradient} text-left transition-all transform hover:scale-[1.02] shadow-lg`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{d.emoji}</span>
              <div>
                <div className="text-2xl font-bold text-white">{d.label}</div>
                <div className="text-sm text-gray-200">{d.description}</div>
                <div className="text-xs text-gray-400 mt-0.5">{d.sub}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="mt-8 text-gray-500 hover:text-gray-300 transition-colors text-sm"
      >
        ← タイトルに戻る
      </button>
    </div>
  )
}
