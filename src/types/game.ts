export type Difficulty = 'weak' | 'normal' | 'strong'
export type GamePhase = 'title' | 'difficulty' | 'drawing' | 'battle' | 'result'
export type BattleSubPhase = 'attacker_select' | 'defender_select' | 'reveal'

export interface WikiCard {
  id: string
  title: string
  power: number
}

export interface RoundResult {
  round: number
  playerCard: WikiCard
  cpuCard: WikiCard
  winner: 'player' | 'cpu' | 'draw'
  playerWasAttacker: boolean
}

export interface GameState {
  phase: GamePhase
  difficulty: Difficulty
  playerHand: WikiCard[]
  cpuHand: WikiCard[]
  playerScore: number
  cpuScore: number
  redrawsLeft: number
  playerFirst: boolean
  round: number
  playerIsAttacker: boolean
  playerFieldCard: WikiCard | null
  cpuFieldCard: WikiCard | null
  battleSubPhase: BattleSubPhase
  roundResults: RoundResult[]
  loading: boolean
  error: string | null
}
