import { WikiCard } from './game'

export interface RoomSettings {
  redrawsLeft: number
  handSize: number
  rounds: number
}

export type RoomStatus = 'waiting' | 'drawing' | 'battle' | 'result'
export type PlayerRole = 'host' | 'guest'
export type RoomBattleSubPhase = 'attacker_select' | 'defender_select' | 'reveal'

export interface MultiplayerRoundResult {
  round: number
  hostCard: WikiCard
  guestCard: WikiCard
  winner: 'host' | 'guest' | 'draw'
  attackerRole: PlayerRole
}

export interface Room {
  code: string
  settings: RoomSettings
  status: RoomStatus

  host_name: string | null
  guest_name: string | null
  rematch_code: string | null

  host_hand: WikiCard[] | null
  guest_hand: WikiCard[] | null
  host_redraws_left: number
  guest_redraws_left: number
  host_confirmed: boolean
  guest_confirmed: boolean

  player_first: PlayerRole | null
  current_attacker: PlayerRole | null
  host_field_card: WikiCard | null
  guest_field_card: WikiCard | null
  host_score: number
  guest_score: number
  round: number
  round_results: MultiplayerRoundResult[]
  battle_sub_phase: RoomBattleSubPhase

  created_at: string
}
