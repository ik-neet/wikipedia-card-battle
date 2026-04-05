import { GameState } from '@/types/game'
import Card from './Card'

interface Props {
  state: GameState
  onRedraw: () => void
  onRetry: () => void
  onStartBattle: () => void
  onBack: () => void
}

export default function DrawScreen({ state, onRedraw, onRetry, onStartBattle, onBack }: Props) {
  const { playerHand, loading, error, redrawsLeft } = state
  const totalPower = playerHand.reduce((s, c) => s + c.power, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d2444] flex flex-col items-center p-4">
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-white text-center mt-8 mb-1">カードを引きました</h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          引き直し残り:{' '}
          <span className={`font-bold ${redrawsLeft > 0 ? 'text-yellow-400' : 'text-gray-600'}`}>
            {redrawsLeft}回
          </span>
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="text-4xl mb-4 animate-spin">🃏</div>
            <p className="text-white text-lg animate-pulse">カードを取得中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
            >
              再試行
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              {playerHand.map(card => (
                <div key={card.id} className="flex flex-col items-center gap-1">
                  <Card card={card} variant="player" />
                  <a
                    href={`https://ja.wikipedia.org/wiki/${encodeURIComponent(card.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-[10px] underline truncate max-w-[7rem]"
                  >
                    記事を見る
                  </a>
                </div>
              ))}
            </div>

            <div className="bg-blue-950/60 border border-blue-800 rounded-xl px-8 py-3 mb-8 text-center">
              <p className="text-blue-300 text-xs mb-0.5">あなたの合計パワー</p>
              <p className="text-yellow-400 font-bold text-2xl">{totalPower.toLocaleString()}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {redrawsLeft > 0 && (
                <button
                  onClick={onRedraw}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  引き直す（残り{redrawsLeft}回）
                </button>
              )}
              <button
                onClick={onStartBattle}
                disabled={loading || playerHand.length === 0}
                className="px-10 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg"
              >
                対戦開始！
              </button>
            </div>

            <button
              onClick={onBack}
              className="mt-6 text-gray-600 hover:text-gray-400 text-sm transition-colors block mx-auto"
            >
              ← 難易度選択に戻る
            </button>
          </>
        )}
      </div>
    </div>
  )
}
