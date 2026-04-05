'use client'

import { useGame } from '@/hooks/useGame'
import TitleScreen from '@/components/TitleScreen'
import DifficultyScreen from '@/components/DifficultyScreen'
import DrawScreen from '@/components/DrawScreen'
import BattleScreen from '@/components/BattleScreen'
import ResultScreen from '@/components/ResultScreen'

export default function Home() {
  const game = useGame()
  const { state } = game

  return (
    <main className="min-h-screen">
      {state.phase === 'title' && (
        <TitleScreen onStart={game.goToDifficulty} />
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
