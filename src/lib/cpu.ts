import { WikiCard, Difficulty } from '@/types/game'

interface SelectParams {
  hand: WikiCard[]
  opponentCard: WikiCard | null
  difficulty: Difficulty
  isAttacker: boolean
}

export function cpuSelectCard({ hand, opponentCard, difficulty, isAttacker }: SelectParams): WikiCard {
  if (hand.length === 0) throw new Error('CPU has no cards')

  const random = () => hand[Math.floor(Math.random() * hand.length)]

  // 先攻はランダム / 弱いはランダム / 相手カードなしはランダム
  if (isAttacker || difficulty === 'weak' || !opponentCard) {
    return random()
  }

  const opponentPower = opponentCard.power
  const stronger = hand.filter(c => c.power > opponentPower)

  if (difficulty === 'normal') {
    // 70%: 相手より強いカードを出す、なければランダム
    if (Math.random() < 0.7) {
      return stronger.length > 0
        ? stronger[Math.floor(Math.random() * stronger.length)]
        : random()
    }
    // 30%: ランダム
    return random()
  }

  // 強い: 相手より強いカードの中でパワーが一番近いカードを出す。なければ最弱カード
  if (stronger.length > 0) {
    return stronger.reduce((closest, c) =>
      c.power - opponentPower < closest.power - opponentPower ? c : closest
    )
  }
  return hand.reduce((min, c) => c.power < min.power ? c : min)
}
