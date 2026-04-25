'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  doc, setDoc, updateDoc, getDoc,
  onSnapshot, runTransaction,
} from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { Room, PlayerRole, RoomSettings, MultiplayerRoundResult } from '@/types/room'
import { WikiCard } from '@/types/game'
import { fetchRandomCards } from '@/lib/wikipedia'

function generateRoomCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
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

  // Firestore リアルタイム購読
  useEffect(() => {
    if (!room?.code) return
    const unsubscribe = onSnapshot(
      doc(db, 'rooms', room.code),
      (snap) => { if (snap.exists()) setRoom(snap.data() as Room) },
    )
    return unsubscribe
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

    updateDoc(doc(db, 'rooms', r.code), {
      status: 'battle',
      player_first: playerFirst,
      current_attacker: playerFirst,
      battle_sub_phase: 'attacker_select',
    }).catch(() => { /* 既に更新済みなら無視 */ })
  }, [room?.host_confirmed, room?.guest_confirmed, room?.host_hand, room?.guest_hand])

  // -------- アクション --------

  const createRoom = useCallback(async (settings: RoomSettings, name: string) => {
    setLoading(true)
    setError(null)
    try {
      const code = generateRoomCode()
      const newRoom: Room = {
        code,
        settings,
        status: 'waiting',
        created_at: new Date().toISOString(),
        host_name: name || 'ホスト',
        guest_name: null,
        host_hand: null,
        guest_hand: null,
        host_redraws_left: settings.redrawsLeft,
        guest_redraws_left: settings.redrawsLeft,
        host_confirmed: false,
        guest_confirmed: false,
        player_first: null,
        current_attacker: null,
        battle_sub_phase: 'attacker_select',
        host_field_card: null,
        guest_field_card: null,
        host_score: 0,
        guest_score: 0,
        round: 0,
        round_results: [],
        rematch_code: null,
      }
      await setDoc(doc(db, 'rooms', code), newRoom)
      setRoom(newRoom)
      setRole('host')
    } catch (e: unknown) {
      console.error('createRoom error:', e)
      const msg = e instanceof Error ? e.message : JSON.stringify(e)
      setError(`ルームの作成に失敗しました: ${msg}`)
    } finally {
      setLoading(false)
    }
  }, [])

  const joinRoom = useCallback(async (code: string, name: string) => {
    setLoading(true)
    setError(null)
    try {
      const snap = await getDoc(doc(db, 'rooms', code.trim()))
      if (!snap.exists()) throw new Error('ルームが見つかりません')
      const data = snap.data() as Room
      if (data.status !== 'waiting') throw new Error('ルームが見つかりません')

      await updateDoc(doc(db, 'rooms', code.trim()), {
        status: 'drawing',
        guest_name: name || 'ゲスト',
      })

      setRoom({ ...data, status: 'drawing', guest_name: name || 'ゲスト' })
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
      await updateDoc(doc(db, 'rooms', r.code), update)
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
      await updateDoc(doc(db, 'rooms', r.code), update)
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
    await updateDoc(doc(db, 'rooms', r.code), update)
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

    await updateDoc(doc(db, 'rooms', r.code), update)
  }, [])

  // トランザクションで battle_sub_phase の二重実行を防止
  const nextRound = useCallback(async () => {
    const r = roomRef.current
    if (!r) return

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(doc(db, 'rooms', r.code))
      if (!snap.exists()) return
      const current = snap.data() as Room
      if (current.battle_sub_phase !== 'reveal') return
      if (!current.host_field_card || !current.guest_field_card) return

      let hostScore = current.host_score
      let guestScore = current.guest_score
      let winner: 'host' | 'guest' | 'draw'

      if (current.host_field_card.power > current.guest_field_card.power) {
        winner = 'host'; hostScore++
      } else if (current.guest_field_card.power > current.host_field_card.power) {
        winner = 'guest'; guestScore++
      } else {
        winner = 'draw'
      }

      const result: MultiplayerRoundResult = {
        round: current.round,
        hostCard: current.host_field_card,
        guestCard: current.guest_field_card,
        winner,
        attackerRole: current.current_attacker!,
      }
      const newResults = [...current.round_results, result]
      const nextRoundNum = current.round + 1

      if (nextRoundNum >= current.settings.rounds) {
        tx.update(snap.ref, {
          status: 'result',
          host_score: hostScore,
          guest_score: guestScore,
          round_results: newResults,
        })
        return
      }

      const nextAttacker: PlayerRole =
        nextRoundNum % 2 === 0
          ? current.player_first!
          : (current.player_first === 'host' ? 'guest' : 'host')

      tx.update(snap.ref, {
        host_score: hostScore,
        guest_score: guestScore,
        round: nextRoundNum,
        current_attacker: nextAttacker,
        host_field_card: null,
        guest_field_card: null,
        battle_sub_phase: 'attacker_select',
        round_results: newResults,
      })
    })
  }, [])

  const requestRematch = useCallback(async () => {
    const r = roomRef.current
    const rl = roleRef.current
    if (!r || rl !== 'host') return

    setLoading(true)
    setError(null)
    try {
      const newCode = generateRoomCode()
      const newRoom: Room = {
        code: newCode,
        settings: r.settings,
        status: 'waiting',
        created_at: new Date().toISOString(),
        host_name: r.host_name,
        guest_name: null,
        host_hand: null,
        guest_hand: null,
        host_redraws_left: r.settings.redrawsLeft,
        guest_redraws_left: r.settings.redrawsLeft,
        host_confirmed: false,
        guest_confirmed: false,
        player_first: null,
        current_attacker: null,
        battle_sub_phase: 'attacker_select',
        host_field_card: null,
        guest_field_card: null,
        host_score: 0,
        guest_score: 0,
        round: 0,
        round_results: [],
        rematch_code: null,
      }
      await setDoc(doc(db, 'rooms', newCode), newRoom)
      await updateDoc(doc(db, 'rooms', r.code), { rematch_code: newCode })
      setRoom(newRoom)
      setRole('host')
    } catch (e: unknown) {
      console.error('requestRematch error:', e)
      const msg = e instanceof Error ? e.message : JSON.stringify(e)
      setError(`再戦の作成に失敗しました: ${msg}`)
    } finally {
      setLoading(false)
    }
  }, [])

  // ゲスト側: rematch_code が設定されたら新しいルームに自動参加
  useEffect(() => {
    if (roleRef.current !== 'guest') return
    const r = roomRef.current
    if (!r?.rematch_code) return

    const newCode = r.rematch_code
    const guestName = r.guest_name ?? 'ゲスト'

    ;(async () => {
      try {
        const snap = await getDoc(doc(db, 'rooms', newCode))
        if (!snap.exists()) return
        const data = snap.data() as Room
        if (data.status !== 'waiting') return
        await updateDoc(doc(db, 'rooms', newCode), { status: 'drawing', guest_name: guestName })
        setRoom({ ...data, status: 'drawing', guest_name: guestName })
        setRole('guest')
      } catch { /* ignore */ }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.rematch_code])

  const reset = useCallback(() => {
    setRoom(null)
    setRole(null)
    setError(null)
    setLoading(false)
  }, [])

  // -------- 導出値 --------
  const myName = room && role ? (role === 'host' ? room.host_name : room.guest_name) ?? 'あなた' : 'あなた'
  const opponentName = room && role ? (role === 'host' ? room.guest_name : room.host_name) ?? '相手' : '相手'
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
    myName, opponentName,
    myHand, opponentHand, myRedraws, myConfirmed, opponentConfirmed,
    myFieldCard, opponentFieldCard, myScore, opponentScore, isMyAttacker, amFirst,
    createRoom, joinRoom, fetchInitialCards, redrawCards, confirmHand, playCard, nextRound, requestRematch, reset,
  }
}
