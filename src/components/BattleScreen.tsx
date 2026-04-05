import { GameState, WikiCard } from '@/types/game'
import Card from './Card'

interface Props {
  state: GameState
  onPlayCard: (card: WikiCard) => void
  onNextRound: () => void
}

export default function BattleScreen({ state, onPlayCard, onNextRound }: Props) {
  const {
    round,
    playerScore,
    cpuScore,
    playerIsAttacker,
    playerFirst,
    battleSubPhase,
    playerHand,
    cpuHand,
    playerFieldCard,
    cpuFieldCard,
    roundResults,
  } = state

  const isLastRound = round === 4

  // プレイヤーがカードを選べるか
  const canPlayerSelect =
    (playerIsAttacker && battleSubPhase === 'attacker_select') ||
    (!playerIsAttacker && battleSubPhase === 'defender_select')

  // ラウンド勝者（reveal フェーズのみ算出）
  const roundWinner =
    battleSubPhase === 'reveal' && playerFieldCard && cpuFieldCard
      ? playerFieldCard.power > cpuFieldCard.power
        ? 'player'
        : cpuFieldCard.power > playerFieldCard.power
        ? 'cpu'
        : 'draw'
      : null

  const getMessage = () => {
    if (battleSubPhase === 'attacker_select') {
      return playerIsAttacker
        ? '🗡️ あなたの番（先攻）。カードを1枚選んでください。'
        : '⏳ CPUが考えています...'
    }
    if (battleSubPhase === 'defender_select') {
      return playerIsAttacker
        ? '⏳ CPUが応戦のカードを選んでいます...'
        : '🛡️ CPUがカードを出しました。応戦するカードを選んでください。'
    }
    if (battleSubPhase === 'reveal') {
      if (roundWinner === 'player') return '🎉 あなたの勝ち！ +1ポイント'
      if (roundWinner === 'cpu') return '💀 CPUの勝ち... +1ポイント (CPU)'
      return '🤝 引き分け'
    }
    return ''
  }

  const messageColor =
    roundWinner === 'player'
      ? 'text-yellow-400'
      : roundWinner === 'cpu'
      ? 'text-red-400'
      : roundWinner === 'draw'
      ? 'text-gray-300'
      : 'text-white'

  // 先攻情報テキスト
  const attackerLabel = playerIsAttacker ? 'あなた（先攻）' : 'CPU（先攻）'

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d2444] flex flex-col">
      {/* ヘッダー */}
      <div className="bg-black/40 px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-white font-bold text-lg">
          <span className="text-blue-400">{playerScore}</span>
          <span className="text-gray-500 mx-2">-</span>
          <span className="text-red-400">{cpuScore}</span>
        </div>
        <div className="text-gray-300 text-sm font-medium">
          ラウンド <span className="text-yellow-400 font-bold">{round + 1}</span> / 5
        </div>
        <div className="text-gray-400 text-xs">{attackerLabel}</div>
      </div>

      {/* CPUの手札エリア */}
      <div className="px-3 pt-3 pb-1">
        <p className="text-gray-500 text-xs text-center mb-2">
          CPUの手札（{cpuHand.length}枚）
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          {cpuHand.map(card => (
            <Card key={card.id} card={card} variant="cpu" hidden small />
          ))}
          {roundResults.map((_, i) => (
            <div
              key={`empty-cpu-${i}`}
              className="w-20 h-28 rounded-lg border border-dashed border-gray-800 opacity-20"
            />
          ))}
        </div>
      </div>

      {/* バトルフィールド */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-2 gap-3">
        <div className="w-full max-w-xs">
          {/* CPUのフィールドカード */}
          <div className="flex items-center gap-3 justify-center mb-3">
            <span className="text-red-400 text-xs w-14 text-right font-medium">CPU</span>
            {cpuFieldCard ? (
              <Card
                card={cpuFieldCard}
                variant="cpu"
                hidden={battleSubPhase !== 'reveal'}
              />
            ) : (
              <div className="w-28 h-40 rounded-lg border-2 border-dashed border-red-900/50 flex items-center justify-center">
                <span className="text-red-900 text-xs">待機中</span>
              </div>
            )}
          </div>

          {(playerFieldCard || cpuFieldCard) && (
            <p className="text-center text-gray-600 font-bold text-xl my-1">vs</p>
          )}

          {/* プレイヤーのフィールドカード */}
          <div className="flex items-center gap-3 justify-center mt-3">
            <span className="text-blue-400 text-xs w-14 text-right font-medium">あなた</span>
            {playerFieldCard ? (
              <Card card={playerFieldCard} variant="player" hidden={false} />
            ) : (
              <div className="w-28 h-40 rounded-lg border-2 border-dashed border-blue-900/50 flex items-center justify-center">
                <span className="text-blue-900 text-xs">
                  {canPlayerSelect && playerIsAttacker ? 'カードを選択' : '待機中'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* メッセージ・アクション */}
      <div className="px-4 py-3 text-center min-h-[80px] flex flex-col items-center justify-center gap-2">
        <p className={`text-base font-bold ${messageColor}`}>{getMessage()}</p>
        {battleSubPhase === 'reveal' && (
          <button
            onClick={onNextRound}
            className="mt-1 px-8 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all transform hover:scale-105 shadow-md text-sm"
          >
            {isLastRound ? '結果を見る →' : '次のラウンドへ →'}
          </button>
        )}
      </div>

      {/* プレイヤーの手札エリア */}
      <div className="px-3 pb-4 bg-black/20 pt-3">
        <p className="text-gray-500 text-xs text-center mb-2">
          あなたの手札（{playerHand.length}枚）
          {canPlayerSelect && (
            <span className="text-yellow-400 ml-1">← タップして選択</span>
          )}
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          {playerHand.map(card => (
            <Card
              key={card.id}
              card={card}
              variant="player"
              hidden={false}
              clickable={canPlayerSelect}
              small
              onClick={() => onPlayCard(card)}
            />
          ))}
          {roundResults.map((_, i) => (
            <div
              key={`empty-player-${i}`}
              className="w-20 h-28 rounded-lg border border-dashed border-gray-800 opacity-20"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
