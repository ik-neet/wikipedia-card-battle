'use client'
import { useState } from 'react'
import { RoomSettings } from '@/types/room'

interface Props {
  onCreateRoom: (settings: RoomSettings, name: string) => void
  onJoinRoom: (code: string, name: string) => void
  loading: boolean
  error: string | null
  onBack: () => void
}

export default function MultiplayerLobby({ onCreateRoom, onJoinRoom, loading, error, onBack }: Props) {
  const [view, setView] = useState<'menu' | 'create' | 'join'>('menu')
  const [settings, setSettings] = useState<RoomSettings>({ redrawsLeft: 3, handSize: 5, rounds: 5 })
  const [joinCode, setJoinCode] = useState('')
  const [playerName, setPlayerName] = useState('')

  const roundsError = settings.rounds > settings.handSize

  const handleCreate = () => {
    if (roundsError || !playerName.trim()) return
    onCreateRoom(settings, playerName.trim())
  }

  const handleJoin = () => {
    if (joinCode.length < 4 || !playerName.trim()) return
    onJoinRoom(joinCode, playerName.trim())
  }

  const setHandSize = (v: number) => {
    const handSize = Math.min(10, Math.max(1, v))
    setSettings(s => ({ ...s, handSize }))
  }
  const setRounds = (v: number) => {
    const rounds = Math.min(10, Math.max(1, v))
    setSettings(s => ({ ...s, rounds }))
  }
  const setRedraws = (v: number) => setSettings(s => ({ ...s, redrawsLeft: Math.max(0, v) }))

  if (view === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d2444] flex flex-col items-center justify-center p-4">
        <h2 className="text-3xl font-bold text-white mb-2">対人戦</h2>
        <p className="text-gray-400 text-sm mb-10">友達とリアルタイムで対戦！</p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => setView('create')}
            className="p-5 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 text-left transition-all transform hover:scale-[1.02] shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏠</span>
              <div>
                <div className="text-xl font-bold text-white">ルームを作成</div>
                <div className="text-sm text-gray-300">ルームを作って相手を待つ</div>
              </div>
            </div>
          </button>
          <button
            onClick={() => setView('join')}
            className="p-5 rounded-xl bg-gradient-to-r from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 text-left transition-all transform hover:scale-[1.02] shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚪</span>
              <div>
                <div className="text-xl font-bold text-white">ルームに入る</div>
                <div className="text-sm text-gray-300">ルームコードを入力して参加</div>
              </div>
            </div>
          </button>
        </div>
        <button onClick={onBack} className="mt-8 text-gray-500 hover:text-gray-300 transition-colors text-sm">
          ← タイトルに戻る
        </button>
      </div>
    )
  }

  if (view === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d2444] flex flex-col items-center p-4">
        <div className="w-full max-w-sm mt-10">
          <h2 className="text-2xl font-bold text-white text-center mb-1">ルームを作成</h2>
          <p className="text-gray-400 text-sm text-center mb-6">ルールをカスタマイズできます</p>

          {/* プレイヤー名 */}
          <div className="mb-4">
            <label className="text-gray-300 text-sm font-medium block mb-2">あなたの名前</label>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="名前を入力"
              maxLength={20}
              className="w-full py-2.5 px-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-600 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-3 mb-6">
            {/* 引き直し回数 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-gray-300 text-sm font-medium mb-3">
                引き直し回数
                <span className="text-gray-500 text-xs ml-2">（デフォルト: 3回）</span>
              </p>
              <div className="flex items-center gap-4">
                <button onClick={() => setRedraws(settings.redrawsLeft - 1)}
                  className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white font-bold text-lg leading-none">−</button>
                <span className="text-white font-bold text-xl w-6 text-center">{settings.redrawsLeft}</span>
                <button onClick={() => setRedraws(settings.redrawsLeft + 1)}
                  className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white font-bold text-lg leading-none">+</button>
              </div>
            </div>

            {/* 手札の数 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-gray-300 text-sm font-medium mb-3">
                手札の数
                <span className="text-gray-500 text-xs ml-2">（1〜10枚、デフォルト: 5枚）</span>
              </p>
              <div className="flex items-center gap-4">
                <button onClick={() => setHandSize(settings.handSize - 1)}
                  className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white font-bold text-lg leading-none">−</button>
                <span className="text-white font-bold text-xl w-6 text-center">{settings.handSize}</span>
                <button onClick={() => setHandSize(settings.handSize + 1)}
                  className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white font-bold text-lg leading-none">+</button>
              </div>
            </div>

            {/* ラウンド数 */}
            <div className={`bg-white/5 border rounded-xl p-4 ${roundsError ? 'border-red-700' : 'border-white/10'}`}>
              <p className="text-gray-300 text-sm font-medium mb-3">
                ラウンド数
                <span className="text-gray-500 text-xs ml-2">（1〜10、デフォルト: 5）</span>
              </p>
              <div className="flex items-center gap-4">
                <button onClick={() => setRounds(settings.rounds - 1)}
                  className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white font-bold text-lg leading-none">−</button>
                <span className="text-white font-bold text-xl w-6 text-center">{settings.rounds}</span>
                <button onClick={() => setRounds(settings.rounds + 1)}
                  className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white font-bold text-lg leading-none">+</button>
              </div>
              {roundsError && (
                <p className="text-red-400 text-xs mt-2">⚠ ラウンド数は手札の数以下にしてください</p>
              )}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

          <button
            onClick={handleCreate}
            disabled={loading || roundsError || !playerName.trim()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'ルームを作成中...' : 'ルームを作成する'}
          </button>
          <button onClick={() => setView('menu')}
            className="mt-4 text-gray-500 hover:text-gray-300 text-sm transition-colors block mx-auto text-center w-full">
            ← 戻る
          </button>
        </div>
      </div>
    )
  }

  // join view
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d2444] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h2 className="text-2xl font-bold text-white text-center mb-1">ルームに入る</h2>
        <p className="text-gray-400 text-sm text-center mb-6">ルームコードを入力してください</p>

        <div className="mb-4">
          <label className="text-gray-300 text-sm font-medium block mb-2">あなたの名前</label>
          <input
            type="text"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="名前を入力"
            maxLength={20}
            className="w-full py-2.5 px-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-600 outline-none focus:border-blue-500"
          />
        </div>

        <label className="text-gray-300 text-sm font-medium block mb-2">ルームコード</label>
        <input
          type="text"
          value={joinCode}
          onChange={e => setJoinCode(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="例: 1234"
          maxLength={4}
          className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-center text-2xl font-bold tracking-widest placeholder-gray-600 outline-none focus:border-blue-500 mb-4"
        />

        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

        <button
          onClick={handleJoin}
          disabled={loading || joinCode.length < 4 || !playerName.trim()}
          className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? '参加中...' : 'ルームに参加する'}
        </button>
        <button onClick={() => setView('menu')}
          className="mt-4 text-gray-500 hover:text-gray-300 text-sm transition-colors block mx-auto text-center w-full">
          ← 戻る
        </button>
      </div>
    </div>
  )
}
