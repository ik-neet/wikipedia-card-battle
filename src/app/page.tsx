'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useGame } from '@/hooks/useGame'
import TitleScreen from '@/components/TitleScreen'
import DifficultyScreen from '@/components/DifficultyScreen'
import DrawScreen from '@/components/DrawScreen'
import BattleScreen from '@/components/BattleScreen'
import ResultScreen from '@/components/ResultScreen'
import MultiplayerGame from '@/components/MultiplayerGame'

type TopMode = 'cpu' | 'multiplayer'

export default function Home() {
  const game = useGame()
  const { state } = game
  const [topMode, setTopMode] = useState<TopMode>('cpu')

  const goToTitle = () => {
    game.reset()
    setTopMode('cpu')
  }

  return (
    <main className="min-h-screen">
      {state.phase === 'title' && topMode === 'cpu' && (
        <TitleScreen
          onStart={game.goToDifficulty}
          onMultiplayer={() => setTopMode('multiplayer')}
        />
      )}

      {state.phase === 'title' && topMode === 'multiplayer' && (
        <MultiplayerGame onBack={goToTitle} />
      )}

      {state.phase === 'difficulty' && (
        <DifficultyScreen
          onSelect={game.startGame}
          onBack={game.reset}
        />
      )}

      {state.phase === 'drawing' && (
        <DrawScreen
          state={state}
          onRedraw={game.redrawCards}
          onRetry={game.retryDraw}
          onStartBattle={game.startBattle}
          onBack={game.goToDifficulty}
        />
      )}

      {state.phase === 'battle' && (
        <BattleScreen
          state={state}
          onPlayCard={game.playerPlayCard}
          onNextRound={game.nextRound}
        />
      )}

      {state.phase === 'result' && (
        <ResultScreen
          state={state}
          onRestart={game.reset}
        />
      )}
    </main>
  )
}
