import { Room, PlayerRole, MultiplayerRoundResult } from '@/types/room'

interface Props {
  room: Room
  role: PlayerRole
  myScore: number
  opponentScore: number
  myName: string
  opponentName: string
  onRematch: () => void
  onRestart: () => void
}

export default function MultiplayerResultScreen({ room, role, myScore, opponentScore, myName, opponentName, onRematch, onRestart }: Props) {
  const isWin = myScore > opponentScore
  const isLose = myScore < opponentScore

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d2444] flex flex-col items-center p-4">
      {/* 勝敗発表 */}
      <div className="text-center mt-8 mb-6">
        {isWin && (
          <>
            <div className="text-6xl mb-2">🏆</div>
            <h2 className="text-4xl font-bold text-yellow-400">{myName}の勝ち！</h2>
          </>
        )}
        {isLose && (
          <>
            <div className="text-6xl mb-2">💀</div>
            <h2 className="text-4xl font-bold text-red-400">{opponentName}の勝ち...</h2>
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
            <p className="text-blue-400 text-xs mb-0.5">{myName}</p>
            <p className="text-blue-400 font-bold text-4xl">{myScore}</p>
          </div>
          <span className="text-gray-600 text-2xl font-bold">-</span>
          <div className="text-center">
            <p className="text-red-400 text-xs mb-0.5">{opponentName}</p>
            <p className="text-red-400 font-bold text-4xl">{opponentScore}</p>
          </div>
        </div>
      </div>

      {/* ラウンド結果 */}
      <div className="w-full max-w-lg mb-8">
        <h3 className="text-gray-300 font-bold text-sm mb-3 text-center tracking-wide">── バトル結果 ──</h3>
        <div className="flex flex-col gap-2">
          {(room.round_results as MultiplayerRoundResult[]).map(result => {
            const myCard = role === 'host' ? result.hostCard : result.guestCard
            const oppCard = role === 'host' ? result.guestCard : result.hostCard
            const myWin = result.winner === role
            const oppWin = result.winner !== role && result.winner !== 'draw'
            const attackerWasMe = result.attackerRole === role

            return (
              <div
                key={result.round}
                className={`px-3 py-3 rounded-xl border ${
                  myWin ? 'border-blue-700 bg-blue-950/40'
                    : oppWin ? 'border-red-700 bg-red-950/40'
                      : 'border-gray-700 bg-gray-900/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-xs">
                    Round {result.round + 1}
                    <span className="ml-1 text-gray-600">({attackerWasMe ? `${myName}先攻` : `${opponentName}先攻`})</span>
                  </span>
                  <span className={`text-xs font-bold ${myWin ? 'text-blue-400' : oppWin ? 'text-red-400' : 'text-gray-400'}`}>
                    {myWin ? `✓ ${myName}の勝ち` : oppWin ? `✗ ${opponentName}の勝ち` : '= 引き分け'}
                  </span>
                </div>
                <div className="flex gap-2 text-xs">
                  <div className="flex-1 min-w-0 bg-blue-950/40 rounded-lg px-2 py-1.5">
                    <p className="text-blue-400 font-medium mb-0.5">{myName}</p>
                    <a href={`https://ja.wikipedia.org/wiki/${encodeURIComponent(myCard.title)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-white hover:text-blue-300 underline block overflow-hidden"
                      style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {myCard.title}
                    </a>
                    <p className="text-yellow-300 font-bold mt-1">{myCard.power.toLocaleString()}</p>
                  </div>
                  <div className="flex-1 min-w-0 bg-red-950/40 rounded-lg px-2 py-1.5">
                    <p className="text-red-400 font-medium mb-0.5">{opponentName}</p>
                    <a href={`https://ja.wikipedia.org/wiki/${encodeURIComponent(oppCard.title)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-white hover:text-red-300 underline block overflow-hidden"
                      style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {oppCard.title}
                    </a>
                    <p className="text-yellow-300 font-bold mt-1">{oppCard.power.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 mb-8">
        {role === 'host' ? (
          <button
            onClick={onRematch}
            className="px-12 py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xl rounded-full transition-all transform hover:scale-105 shadow-xl"
          >
            同じメンバーで再戦
          </button>
        ) : (
          room.rematch_code == null
            ? <p className="text-gray-400 text-sm animate-pulse">ホストが再戦を申し込むのを待っています...</p>
            : <p className="text-green-400 text-sm animate-pulse">再戦ルームに移動中...</p>
        )}
        <button
          onClick={onRestart}
          className="px-12 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl rounded-full transition-all transform hover:scale-105 shadow-xl"
        >
          タイトルに戻る
        </button>
      </div>
    </div>
  )
}
