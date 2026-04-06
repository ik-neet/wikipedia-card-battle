'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Room, PlayerRole, RoomSettings, MultiplayerRoundResult } from '@/types/room'
import { WikiCard } from '@/types/game'
import { fetchRandomCards } from '@/lib/wikipedia'

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function useMultiplayerGame() {
  const [room, setRoom] = useState<Room | null>(null)
  const [role, setRole] = useState<PlayerRole | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // refs で常に最新の state を参照
  const roomRef = useRef<Room | null>(null)
  const roleRef = useRef<PlayerRole | null>(null)
  roomRef.current = room
  roleRef.current = role

  // Supabase リアルタイム購読
  useEffect(() => {
    if (!room?.code) return
    const channel = supabase
      .channel(`room:${room.code}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `code=eq.${room.code}` },
        (payload) => setRoom(payload.new as Room),
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [room?.code])

  // ホスト側: 両者確認済みになったらバトル開始
  useEffect(() => {
    if (roleRef.current !== 'host') return
    const r = roomRef.current
    if (!r || r.status !== 'drawing') return
    if (!r.host_confirmed || !r.guest_confirmed) return
    if (!r.host_hand || !r.guest_hand) return

    const hostPower = r.host_hand.reduce((s, c) => s + c.power, 0)
    const guestPower = r.guest_hand.reduce((s, c) => s + c.power, 0)
    const playerFirst: PlayerRole = hostPower >= guestPower ? 'host' : 'guest'

    supabase.from('rooms')
      .update({ status: 'battle', player_first: playerFirst, current_attacker: playerFirst, battle_sub_phase: 'attacker_select' })
      .eq('code', r.code)
      .eq('status', 'drawing')
      .then()
  }, [room?.host_confirmed, room?.guest_confirmed, room?.host_hand, room?.guest_hand])

  // -------- アクション --------

  const createRoom = useCallback(async (settings: RoomSettings) => {
    setLoading(true)
    setError(null)
    try {
      const code = generateRoomCode()
      const { data, error: err } = await supabase
        .from('rooms')
        .insert({ code, settings, host_redraws_left: settings.redrawsLeft, guest_redraws_left: settings.redrawsLeft })
        .select()
        .single()
      if (err) throw err
      setRoom(data as Room)
      setRole('host')
    } catch (e: unknown) {
      console.error('createRoom error:', e)
      const msg = e instanceof Error ? e.message : JSON.stringify(e)
      setError(`ルームの作成に失敗しました: ${msg}`)
    } finally {
      setLoading(false)
    }
  }, [])

  const joinRoom = useCallback(async (code: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('rooms')
        .select()
        .eq('code', code.toUpperCase().trim())
        .eq('status', 'waiting')
        .single()
      if (err || !data) throw new Error('ルームが見つかりません')

      const { error: updErr } = await supabase
        .from('rooms')
        .update({ status: 'drawing' })
        .eq('code', data.code)
      if (updErr) throw updErr

      setRoom({ ...(data as Room), status: 'drawing' })
      setRole('guest')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'ルームへの参加に失敗しました。')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchInitialCards = useCallback(async () => {
    const r = roomRef.current
    const rl = roleRef.current
    if (!r || !rl) return
    const currentHand = rl === 'host' ? r.host_hand : r.guest_hand
    if (currentHand !== null) return

    setLoading(true)
    setError(null)
    try {
      const hand = await fetchRandomCards(r.settings.handSize)
      const update = rl === 'host' ? { host_hand: hand } : { guest_hand: hand }
      await supabase.from('rooms').update(update).eq('code', r.code)
    } catch {
      setError('カードの取得に失敗しました。')
    } finally {
      setLoading(false)
    }
  }, [])

  const redrawCards = useCallback(async () => {
    const r = roomRef.current
    const rl = roleRef.current
    if (!r || !rl) return
    const redrawsLeft = rl === 'host' ? r.host_redraws_left : r.guest_redraws_left
    if (redrawsLeft <= 0) return

    setLoading(true)
    try {
      const hand = await fetchRandomCards(r.settings.handSize)
      const update = rl === 'host'
        ? { host_hand: hand, host_redraws_left: redrawsLeft - 1 }
        : { guest_hand: hand, guest_redraws_left: redrawsLeft - 1 }
      await supabase.from('rooms').update(update).eq('code', r.code)
    } catch {
      setError('カードの取得に失敗しました。')
    } finally {
      setLoading(false)
    }
  }, [])

  const confirmHand = useCallback(async () => {
    const r = roomRef.current
    const rl = roleRef.current
    if (!r || !rl) return
    const update = rl === 'host' ? { host_confirmed: true } : { guest_confirmed: true }
    await supabase.from('rooms').update(update).eq('code', r.code)
  }, [])

  const playCard = useCallback(async (card: WikiCard) => {
    const r = roomRef.current
    const rl = roleRef.current
    if (!r || !rl) return

    const isAttacker = rl === r.current_attacker
    const canPlay =
      (isAttacker && r.battle_sub_phase === 'attacker_select') ||
      (!isAttacker && r.battle_sub_phase === 'defender_select')
    if (!canPlay) return

    const myHand = (rl === 'host' ? r.host_hand : r.guest_hand) || []
    const newHand = myHand.filter(c => c.id !== card.id)
    const nextSubPhase = isAttacker ? 'defender_select' : 'reveal'

    const update = rl === 'host'
      ? { host_hand: newHand, host_field_card: card, battle_sub_phase: nextSubPhase }
      : { guest_hand: newHand, guest_field_card: card, battle_sub_phase: nextSubPhase }

    await supabase.from('rooms').update(update).eq('code', r.code)
  }, [])

  const nextRound = useCallback(async () => {
    const r = roomRef.current
    if (!r || r.battle_sub_phase !== 'reveal') return
    if (!r.host_field_card || !r.guest_field_card) return

    let hostScore = r.host_score
    let guestScore = r.guest_score
    let winner: 'host' | 'guest' | 'draw'

    if (r.host_field_card.power > r.guest_field_card.power) {
      winner = 'host'; hostScore++
    } else if (r.guest_field_card.power > r.host_field_card.power) {
      winner = 'guest'; guestScore++
    } else {
      winner = 'draw'
    }

    const result: MultiplayerRoundResult = {
      round: r.round,
      hostCard: r.host_field_card,
      guestCard: r.guest_field_card,
      winner,
      attackerRole: r.current_attacker!,
    }
    const newResults = [...r.round_results, result]
    const nextRoundNum = r.round + 1

    if (nextRoundNum >= r.settings.rounds) {
      await supabase.from('rooms')
        .update({ status: 'result', host_score: hostScore, guest_score: guestScore, round_results: newResults })
        .eq('code', r.code)
        .eq('battle_sub_phase', 'reveal')
      return
    }

    const nextAttacker: PlayerRole =
      nextRoundNum % 2 === 0
        ? r.player_first!
        : (r.player_first === 'host' ? 'guest' : 'host')

    await supabase.from('rooms')
      .update({
        host_score: hostScore, guest_score: guestScore,
        round: nextRoundNum, current_attacker: nextAttacker,
        host_field_card: null, guest_field_card: null,
        battle_sub_phase: 'attacker_select',
        round_results: newResults,
      })
      .eq('code', r.code)
      .eq('battle_sub_phase', 'reveal')
  }, [])

  const reset = useCallback(() => {
    setRoom(null)
    setRole(null)
    setError(null)
    setLoading(false)
  }, [])

  // -------- 導出値 --------
  const myHand = room && role ? (role === 'host' ? room.host_hand : room.guest_hand) : null
  const opponentHand = room && role ? (role === 'host' ? room.guest_hand : room.host_hand) : null
  const myRedraws = room && role ? (role === 'host' ? room.host_redraws_left : room.guest_redraws_left) : 0
  const myConfirmed = room && role ? (role === 'host' ? room.host_confirmed : room.guest_confirmed) : false
  const opponentConfirmed = room && role ? (role === 'host' ? room.guest_confirmed : room.host_confirmed) : false
  const myFieldCard = room && role ? (role === 'host' ? room.host_field_card : room.guest_field_card) : null
  const opponentFieldCard = room && role ? (role === 'host' ? room.guest_field_card : room.host_field_card) : null
  const myScore = room && role ? (role === 'host' ? room.host_score : room.guest_score) : 0
  const opponentScore = room && role ? (role === 'host' ? room.guest_score : room.host_score) : 0
  const isMyAttacker = !!(room && role && room.current_attacker === role)
  const amFirst = !!(room && role && room.player_first === role)

  return {
    room, role, loading, error,
    myHand, opponentHand, myRedraws, myConfirmed, opponentConfirmed,
    myFieldCard, opponentFieldCard, myScore, opponentScore, isMyAttacker, amFirst,
    createRoom, joinRoom, fetchInitialCards, redrawCards, confirmHand, playCard, nextRound, reset,
  }
}
