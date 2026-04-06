import { useState, useCallback, useEffect, useRef } from 'react'
import { GameState, WikiCard, Difficulty, RoundResult, BattleSubPhase } from '@/types/game'
import { fetchRandomCards } from '@/lib/wikipedia'
import { cpuSelectCard } from '@/lib/cpu'

const initialState: GameState = {
  phase: 'title',
  difficulty: 'normal',
  playerHand: [],
  cpuHand: [],
  playerScore: 0,
  cpuScore: 0,
  redrawsLeft: 3,
  playerFirst: true,
  round: 0,
  playerIsAttacker: true,
  playerFieldCard: null,
  cpuFieldCard: null,
  battleSubPhase: 'attacker_select',
  roundResults: [],
  loading: false,
  error: null,
}

export function useGame() {
  const [state, setState] = useState<GameState>(initialState)
  const stateRef = useRef<GameState>(initialState)
  stateRef.current = state

  const goToDifficulty = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'difficulty', error: null }))
  }, [])

  const startGame = useCallback(async (difficulty: Difficulty) => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      difficulty,
      phase: 'drawing',
      redrawsLeft: 3,
      playerHand: [],
      cpuHand: [],
    }))
    try {
      const cpuDrawCount = difficulty === 'strong' ? 10 : 5
      const [playerHand, cpuDrawn] = await Promise.all([
        fetchRandomCards(5),
        fetchRandomCards(cpuDrawCount),
      ])
      const cpuHand =
        difficulty === 'strong'
          ? [...cpuDrawn].sort((a, b) => b.power - a.power).slice(0, 5)
          : cpuDrawn
      setState(prev => ({ ...prev, playerHand, cpuHand, loading: false }))
    } catch {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'カードの取得に失敗しました。再試行してください。',
      }))
    }
  }, [])

  const retryDraw = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const [playerHand, cpuHand] = await Promise.all([
        fetchRandomCards(5),
        fetchRandomCards(5),
      ])
      setState(prev => ({ ...prev, playerHand, cpuHand, loading: false }))
    } catch {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'カードの取得に失敗しました。再試行してください。',
      }))
    }
  }, [])

  const redrawCards = useCallback(async () => {
    const { redrawsLeft, loading } = stateRef.current
    if (redrawsLeft <= 0 || loading) return
    setState(prev => ({ ...prev, loading: true, error: null, redrawsLeft: prev.redrawsLeft - 1 }))
    try {
      const playerHand = await fetchRandomCards(5)
      setState(prev => ({ ...prev, playerHand, loading: false }))
    } catch {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'カードの取得に失敗しました。',
        redrawsLeft: prev.redrawsLeft + 1,
      }))
    }
  }, [])

  const startBattle = useCallback(() => {
    setState(prev => {
      const playerTotal = prev.playerHand.reduce((s, c) => s + c.power, 0)
      const cpuTotal = prev.cpuHand.reduce((s, c) => s + c.power, 0)
      const playerFirst = playerTotal >= cpuTotal
      return {
        ...prev,
        phase: 'battle',
        playerFirst,
        round: 0,
        playerIsAttacker: playerFirst,
        playerScore: 0,
        cpuScore: 0,
        playerFieldCard: null,
        cpuFieldCard: null,
        battleSubPhase: 'attacker_select' as BattleSubPhase,
        roundResults: [],
      }
    })
  }, [])

  const playerPlayCard = useCallback((card: WikiCard) => {
    setState(prev => {
      const { battleSubPhase, playerIsAttacker } = prev
      const canPlay =
        (playerIsAttacker && battleSubPhase === 'attacker_select') ||
        (!playerIsAttacker && battleSubPhase === 'defender_select')
      if (!canPlay) return prev

      const newHand = prev.playerHand.filter(c => c.id !== card.id)
      const nextSubPhase: BattleSubPhase = playerIsAttacker ? 'defender_select' : 'reveal'

      return {
        ...prev,
        playerHand: newHand,
        playerFieldCard: card,
        battleSubPhase: nextSubPhase,
      }
    })
  }, [])

  const nextRound = useCallback(() => {
    setState(prev => {
      if (!prev.playerFieldCard || !prev.cpuFieldCard) return prev

      const { playerFieldCard, cpuFieldCard, round, playerFirst } = prev
      let playerScore = prev.playerScore
      let cpuScore = prev.cpuScore
      let winner: 'player' | 'cpu' | 'draw'

      if (playerFieldCard.power > cpuFieldCard.power) {
        winner = 'player'
        playerScore++
      } else if (cpuFieldCard.power > playerFieldCard.power) {
        winner = 'cpu'
        cpuScore++
      } else {
        winner = 'draw'
      }

      const result: RoundResult = {
        round,
        playerCard: playerFieldCard,
        cpuCard: cpuFieldCard,
        winner,
        playerWasAttacker: prev.playerIsAttacker,
      }

      const nextRoundNum = round + 1

      if (nextRoundNum >= 5) {
        return {
          ...prev,
          playerScore,
          cpuScore,
          roundResults: [...prev.roundResults, result],
          phase: 'result',
        }
      }

      const nextPlayerIsAttacker =
        nextRoundNum % 2 === 0 ? playerFirst : !playerFirst

      return {
        ...prev,
        playerScore,
        cpuScore,
        round: nextRoundNum,
        playerIsAttacker: nextPlayerIsAttacker,
        playerFieldCard: null,
        cpuFieldCard: null,
        battleSubPhase: 'attacker_select' as BattleSubPhase,
        roundResults: [...prev.roundResults, result],
      }
    })
  }, [])

  const reset = useCallback(() => setState(initialState), [])

  // CPU自動プレイ
  useEffect(() => {
    if (state.phase !== 'battle') return
    const { battleSubPhase, playerIsAttacker } = state

    // CPU が先攻のとき
    if (battleSubPhase === 'attacker_select' && !playerIsAttacker) {
      const timer = setTimeout(() => {
        setState(prev => {
          if (
            prev.phase !== 'battle' ||
            prev.battleSubPhase !== 'attacker_select' ||
            prev.playerIsAttacker
          ) return prev

          const card = cpuSelectCard({
            hand: prev.cpuHand,
            opponentCard: null,
            difficulty: prev.difficulty,
            isAttacker: true,
          })

          return {
            ...prev,
            cpuHand: prev.cpuHand.filter(c => c.id !== card.id),
            cpuFieldCard: card,
            battleSubPhase: 'defender_select' as BattleSubPhase,
          }
        })
      }, 1200)
      return () => clearTimeout(timer)
    }

    // CPU が後攻のとき（プレイヤーがカードを出した後）
    if (battleSubPhase === 'defender_select' && playerIsAttacker) {
      const timer = setTimeout(() => {
        setState(prev => {
          if (
            prev.phase !== 'battle' ||
            prev.battleSubPhase !== 'defender_select' ||
            !prev.playerIsAttacker
          ) return prev

          const card = cpuSelectCard({
            hand: prev.cpuHand,
            opponentCard: prev.playerFieldCard,
            difficulty: prev.difficulty,
            isAttacker: false,
          })

          return {
            ...prev,
            cpuHand: prev.cpuHand.filter(c => c.id !== card.id),
            cpuFieldCard: card,
            battleSubPhase: 'reveal' as BattleSubPhase,
          }
        })
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [state.phase, state.battleSubPhase, state.playerIsAttacker])

  return {
    state,
    goToDifficulty,
    startGame,
    retryDraw,
    redrawCards,
    startBattle,
    playerPlayCard,
    nextRound,
    reset,
  }
}
