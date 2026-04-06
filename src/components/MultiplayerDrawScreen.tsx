import { Room, PlayerRole } from '@/types/room'
import { WikiCard } from '@/types/game'
import Card from './Card'

interface Props {
  room: Room
  myHand: WikiCard[] | null
  myRedraws: number
  myConfirmed: boolean
  opponentConfirmed: boolean
  loading: boolean
  error: string | null
  onRetry: () => void
  onRedraw: () => void
  onConfirm: () => void
}

export default function MultiplayerDrawScreen({
  room, myHand, myRedraws, myConfirmed, opponentConfirmed,
  loading, error, onRetry, onRedraw, onConfirm,
}: Props) {
  const totalPower = myHand?.reduce((s, c) => s + c.power, 0) ?? 0
  const bothConfirmed = myConfirmed && opponentConfirmed

  if (bothConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d2444] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-spin">⚔️</div>
          <p className="text-white text-lg font-bold animate-pulse">バトル開始の準備中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d2444] flex flex-col items-center p-4">
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-white text-center mt-8 mb-1">手札を確認</h2>
        <div className="text-center mb-3">
          <span className="text-gray-500 text-xs">ルームコード: </span>
          <span className="text-yellow-400 font-mono font-bold text-sm tracking-widest">{room.code}</span>
        </div>

        {/* 相手の状態 */}
        <div className={`text-center text-sm mb-5 py-2 rounded-lg ${opponentConfirmed ? 'bg-green-900/40 text-green-400' : 'bg-gray-900/40 text-gray-500'}`}>
          {opponentConfirmed ? '✓ 相手の準備ができました' : '⏳ 相手の準備を待っています...'}
        </div>

        {loading && !myHand ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="text-4xl mb-4 animate-spin">🃏</div>
            <p className="text-white text-lg animate-pulse">カードを取得中...</p>
          </div>
        ) : error && !myHand ? (
          <div className="text-center py-16">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={onRetry} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg">
              再試行
            </button>
          </div>
        ) : myHand ? (
          <>
            <p className="text-gray-400 text-sm text-center mb-4">
              引き直し残り:{' '}
              <span className={`font-bold ${myRedraws > 0 ? 'text-yellow-400' : 'text-gray-600'}`}>
                {myRedraws}回
              </span>
            </p>

            <div className="flex flex-wrap gap-3 justify-center mb-6">
              {myHand.map(card => (
                <div key={card.id} className="flex flex-col items-center gap-1">
                  <Card card={card} variant="player" />
                  <a
                    href={`https://ja.wikipedia.org/wiki/${encodeURIComponent(card.title)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-[10px] underline truncate max-w-[7rem]"
                  >
                    記事を見る
                  </a>
                </div>
              ))}
            </div>

            <div className="bg-blue-950/60 border border-blue-800 rounded-xl px-8 py-3 mb-6 text-center">
              <p className="text-blue-300 text-xs mb-0.5">あなたの合計パワー</p>
              <p className="text-yellow-400 font-bold text-2xl">{totalPower.toLocaleString()}</p>
            </div>

            {myConfirmed ? (
              <div className="px-10 py-3 bg-green-800/50 border border-green-700 text-green-400 font-bold rounded-lg text-center">
                ✓ 準備完了！相手を待っています...
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {myRedraws > 0 && (
                  <button
                    onClick={onRedraw}
                    disabled={loading}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? '取得中...' : `引き直す（残り${myRedraws}回）`}
                  </button>
                )}
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="px-10 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg"
                >
                  この手札で決定！
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
