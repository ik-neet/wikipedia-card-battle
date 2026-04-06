import { Room, PlayerRole } from '@/types/room'
import { WikiCard } from '@/types/game'
import Card from './Card'

interface Props {
  room: Room
  role: PlayerRole
  myHand: WikiCard[]
  opponentHand: WikiCard[]
  myFieldCard: WikiCard | null
  opponentFieldCard: WikiCard | null
  myScore: number
  opponentScore: number
  isMyAttacker: boolean
  amFirst: boolean
  myName: string
  opponentName: string
  onPlayCard: (card: WikiCard) => void
  onNextRound: () => void
}

export default function MultiplayerBattleScreen({
  room, myHand, opponentHand, myFieldCard, opponentFieldCard,
  myScore, opponentScore, isMyAttacker, amFirst, myName, opponentName, onPlayCard, onNextRound,
}: Props) {
  const { round, battle_sub_phase, settings } = room
  const isLastRound = round === settings.rounds - 1

  const canPlayCard =
    (isMyAttacker && battle_sub_phase === 'attacker_select') ||
    (!isMyAttacker && battle_sub_phase === 'defender_select')

  const roundWinner =
    battle_sub_phase === 'reveal' && myFieldCard && opponentFieldCard
      ? myFieldCard.power > opponentFieldCard.power ? 'me'
        : opponentFieldCard.power > myFieldCard.power ? 'opponent'
        : 'draw'
      : null

  const showFirstAttackNotice = round === 0 && battle_sub_phase === 'attacker_select'

  const getMessage = () => {
    if (battle_sub_phase === 'attacker_select') {
      return isMyAttacker ? `🗡️ ${myName}の番（先攻）。カードを1枚選んでください。` : `⏳ ${opponentName}がカードを選んでいます...`
    }
    if (battle_sub_phase === 'defender_select') {
      return isMyAttacker ? `⏳ ${opponentName}が応戦カードを選んでいます...` : `🛡️ ${opponentName}がカードを出しました。応戦するカードを選んでください。`
    }
    if (battle_sub_phase === 'reveal') {
      if (roundWinner === 'me') return `🎉 ${myName}の勝ち！ +1ポイント`
      if (roundWinner === 'opponent') return `💀 ${opponentName}の勝ち... +1ポイント`
      return '🤝 引き分け'
    }
    return ''
  }

  const messageColor =
    roundWinner === 'me' ? 'text-yellow-400'
      : roundWinner === 'opponent' ? 'text-red-400'
        : roundWinner === 'draw' ? 'text-gray-300'
          : 'text-white'

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d2444] flex flex-col">
      {/* ヘッダー */}
      <div className="bg-black/40 px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-white font-bold text-lg">
          <span className="text-blue-400">{myScore}</span>
          <span className="text-gray-500 mx-2">-</span>
          <span className="text-red-400">{opponentScore}</span>
        </div>
        <div className="text-gray-300 text-sm font-medium">
          ラウンド <span className="text-yellow-400 font-bold">{round + 1}</span> / {settings.rounds}
        </div>
        <div className="text-gray-400 text-xs">{isMyAttacker ? `${myName}（先攻）` : `${opponentName}（先攻）`}</div>
      </div>

      {/* 相手の手札 */}
      <div className="px-3 pt-3 pb-1">
        <p className="text-gray-500 text-xs text-center mb-2">{opponentName}の手札（{opponentHand.length}枚）</p>
        <div className="flex gap-2 justify-center flex-wrap">
          {opponentHand.map(card => (
            <Card key={card.id} card={card} variant="cpu" hidden small />
          ))}
        </div>
      </div>

      {/* バトルフィールド */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-2 gap-3">
        <div className="w-full max-w-xs">
          {/* 相手のフィールドカード */}
          <div className="flex items-center gap-3 justify-center mb-3">
            <span className="text-red-400 text-xs w-14 text-right font-medium">{opponentName}</span>
            {opponentFieldCard ? (
              <div className="flex flex-col items-center gap-1">
                <Card card={opponentFieldCard} variant="cpu" hidden={battle_sub_phase !== 'reveal'} />
                {battle_sub_phase === 'reveal' && (
                  <a href={`https://ja.wikipedia.org/wiki/${encodeURIComponent(opponentFieldCard.title)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 text-[10px] underline truncate max-w-[7rem]">
                    記事を見る
                  </a>
                )}
              </div>
            ) : (
              <div className="w-28 h-40 rounded-lg border-2 border-dashed border-red-900/50 flex items-center justify-center">
                <span className="text-red-900 text-xs">待機中</span>
              </div>
            )}
          </div>

          {(myFieldCard || opponentFieldCard) && (
            <p className="text-center text-gray-600 font-bold text-xl my-1">vs</p>
          )}

          {/* 自分のフィールドカード */}
          <div className="flex items-center gap-3 justify-center mt-3">
            <span className="text-blue-400 text-xs w-14 text-right font-medium">{myName}</span>
            {myFieldCard ? (
              <div className="flex flex-col items-center gap-1">
                <Card card={myFieldCard} variant="player" />
                {battle_sub_phase === 'reveal' && (
                  <a href={`https://ja.wikipedia.org/wiki/${encodeURIComponent(myFieldCard.title)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-[10px] underline truncate max-w-[7rem]">
                    記事を見る
                  </a>
                )}
              </div>
            ) : (
              <div className="w-28 h-40 rounded-lg border-2 border-dashed border-blue-900/50 flex items-center justify-center">
                <span className="text-blue-900 text-xs">
                  {canPlayCard && isMyAttacker ? 'カードを選択' : '待機中'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* メッセージ・アクション */}
      <div className="px-4 py-3 text-center min-h-[80px] flex flex-col items-center justify-center gap-2">
        {showFirstAttackNotice && (
          <p className="text-gray-300 text-xs mb-1">
            手札の合計パワーが高いため、
            <span className="text-yellow-400 font-bold">{amFirst ? myName : opponentName}</span>
            が先攻となります。

          </p>
        )}
        <p className={`text-base font-bold ${messageColor}`}>{getMessage()}</p>
        {battle_sub_phase === 'reveal' && (
          <button
            onClick={onNextRound}
            className="mt-1 px-8 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all transform hover:scale-105 shadow-md text-sm"
          >
            {isLastRound ? '結果を見る →' : '次のラウンドへ →'}
          </button>
        )}
      </div>

      {/* 自分の手札 */}
      <div className="px-3 pb-4 bg-black/20 pt-3">
        <p className="text-gray-500 text-xs text-center mb-2">
          {myName}の手札（{myHand.length}枚）
          {canPlayCard && <span className="text-yellow-400 ml-1">← タップして選択</span>}
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          {myHand.map(card => (
            <Card
              key={card.id}
              card={card}
              variant="player"
              clickable={canPlayCard}
              small
              onClick={() => onPlayCard(card)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
