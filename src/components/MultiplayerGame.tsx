'use client'
import { useEffect } from 'react'
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame'
import MultiplayerLobby from './MultiplayerLobby'
import MultiplayerDrawScreen from './MultiplayerDrawScreen'
import MultiplayerBattleScreen from './MultiplayerBattleScreen'
import MultiplayerResultScreen from './MultiplayerResultScreen'

interface Props {
  onBack: () => void
}

export default function MultiplayerGame({ onBack }: Props) {
  const game = useMultiplayerGame()
  const { room, role, loading, error } = game

  // drawing フェーズに入ったら初期手札を取得
  useEffect(() => {
    if (room?.status === 'drawing') {
      game.fetchInitialCards()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.status])

  // ロビー
  if (!room || !role) {
    return (
      <MultiplayerLobby
        onCreateRoom={game.createRoom}
        onJoinRoom={game.joinRoom}
        loading={loading}
        error={error}
        onBack={onBack}
      />
    )
  }

  // 相手待ち（ホストのみ）
  if (room.status === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d2444] flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">⏳</div>
          <h2 className="text-2xl font-bold text-white mb-2">対戦相手を待っています</h2>
          <p className="text-gray-400 text-sm mb-6">以下のルームコードを相手に教えてください</p>
          <div className="bg-white/10 border border-white/20 rounded-2xl px-10 py-4 mb-4 inline-block">
            <p className="text-gray-400 text-xs mb-1">ルームコード</p>
            <p className="text-yellow-400 font-mono font-bold text-4xl tracking-widest">{room.code}</p>
          </div>
          <p className="text-gray-500 text-xs mb-8">
            設定: 手札{room.settings.handSize}枚 / {room.settings.rounds}ラウンド / 引き直し{room.settings.redrawsLeft}回
          </p>
          <button onClick={game.reset} className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
            ← キャンセル
          </button>
        </div>
      </div>
    )
  }

  // 手札確認
  if (room.status === 'drawing') {
    return (
      <MultiplayerDrawScreen
        room={room}
        myHand={game.myHand}
        myRedraws={game.myRedraws}
        myConfirmed={game.myConfirmed}
        opponentConfirmed={game.opponentConfirmed}
        loading={loading}
        error={error}
        onRetry={game.fetchInitialCards}
        onRedraw={game.redrawCards}
        onConfirm={game.confirmHand}
      />
    )
  }

  // バトル
  if (room.status === 'battle') {
    return (
      <MultiplayerBattleScreen
        room={room}
        role={role}
        myHand={game.myHand || []}
        opponentHand={game.opponentHand || []}
        myFieldCard={game.myFieldCard}
        opponentFieldCard={game.opponentFieldCard}
        myScore={game.myScore}
        opponentScore={game.opponentScore}
        isMyAttacker={game.isMyAttacker}
        amFirst={game.amFirst}
        onPlayCard={game.playCard}
        onNextRound={game.nextRound}
      />
    )
  }

  // 結果
  return (
    <MultiplayerResultScreen
      room={room}
      role={role}
      myScore={game.myScore}
      opponentScore={game.opponentScore}
      onRestart={game.reset}
    />
  )
}
