import { GameState } from '@/types/game'
import ShareButtons from './ShareButtons'

interface Props {
  state: GameState
  onRestart: () => void
}

const difficultyLabel: Record<string, string> = {
  weak: '弱い',
  normal: '普通',
  strong: '強い',
}

export default function ResultScreen({ state, onRestart }: Props) {
  const { playerScore, cpuScore, roundResults, difficulty } = state

  const isWin = playerScore > cpuScore
  const isLose = playerScore < cpuScore

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d2444] flex flex-col items-center p-4">
      {/* 勝敗発表 */}
      <div className="text-center mt-8 mb-6">
        {isWin && (
          <>
            <div className="text-6xl mb-2">🏆</div>
            <h2 className="text-4xl font-bold text-yellow-400">あなたの勝ち！</h2>
          </>
        )}
        {isLose && (
          <>
            <div className="text-6xl mb-2">💀</div>
            <h2 className="text-4xl font-bold text-red-400">CPUの勝ち...</h2>
          </>
        )}
        {!isWin && !isLose && (
          <>
            <div className="text-6xl mb-2">🤝</div>
            <h2 className="text-4xl font-bold text-gray-300">引き分け</h2>
          </>
        )}

        <div className="mt-3 flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="text-blue-400 text-xs mb-0.5">あなた</p>
            <p className="text-blue-400 font-bold text-4xl">{playerScore}</p>
          </div>
          <span className="text-gray-600 text-2xl font-bold">-</span>
          <div className="text-center">
            <p className="text-red-400 text-xs mb-0.5">CPU ({difficultyLabel[difficulty]})</p>
            <p className="text-red-400 font-bold text-4xl">{cpuScore}</p>
          </div>
        </div>
      </div>

      {/* ラウンド結果一覧 */}
      <div className="w-full max-w-lg mb-8">
        <h3 className="text-gray-300 font-bold text-sm mb-3 text-center tracking-wide">
          ── バトル結果 ──
        </h3>
        <div className="flex flex-col gap-2">
          {roundResults.map(result => (
            <div
              key={result.round}
              className={`px-3 py-3 rounded-xl border ${
                result.winner === 'player'
                  ? 'border-blue-700 bg-blue-950/40'
                  : result.winner === 'cpu'
                  ? 'border-red-700 bg-red-950/40'
                  : 'border-gray-700 bg-gray-900/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-xs">
                  Round {result.round + 1}
                  <span className="ml-1 text-gray-600">
                    ({result.playerWasAttacker ? 'あなた先攻' : 'CPU先攻'})
                  </span>
                </span>
                <span
                  className={`text-xs font-bold ${
                    result.winner === 'player'
                      ? 'text-blue-400'
                      : result.winner === 'cpu'
                      ? 'text-red-400'
                      : 'text-gray-400'
                  }`}
                >
                  {result.winner === 'player'
                    ? '✓ あなたの勝ち'
                    : result.winner === 'cpu'
                    ? '✗ CPUの勝ち'
                    : '= 引き分け'}
                </span>
              </div>

              <div className="flex gap-2 text-xs">
                <div className="flex-1 min-w-0 bg-blue-950/40 rounded-lg px-2 py-1.5">
                  <p className="text-blue-400 font-medium mb-0.5">あなた</p>
                  <a
                    href={`https://ja.wikipedia.org/wiki/${encodeURIComponent(result.playerCard.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-300 underline block overflow-hidden"
                    style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                  >
                    {result.playerCard.title}
                  </a>
                  <p className="text-yellow-300 font-bold mt-1">{result.playerCard.power.toLocaleString()}</p>
                </div>
                <div className="flex-1 min-w-0 bg-red-950/40 rounded-lg px-2 py-1.5">
                  <p className="text-red-400 font-medium mb-0.5">CPU</p>
                  <a
                    href={`https://ja.wikipedia.org/wiki/${encodeURIComponent(result.cpuCard.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-red-300 underline block overflow-hidden"
                    style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                  >
                    {result.cpuCard.title}
                  </a>
                  <p className="text-yellow-300 font-bold mt-1">{result.cpuCard.power.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ShareButtons text={
        `【Wikipedia Card Battle】CPU戦（${difficultyLabel[difficulty]}）\n` +
        `あなた ${playerScore} - ${cpuScore} CPU\n` +
        (isWin ? 'あなたの勝ち！🏆' : isLose ? 'CPUの勝ち...💀' : '引き分け🤝')
      } />

      <button
        onClick={onRestart}
        className="px-12 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl rounded-full transition-all transform hover:scale-105 shadow-xl mb-8"
      >
        もう一度遊ぶ
      </button>
    </div>
  )
}
