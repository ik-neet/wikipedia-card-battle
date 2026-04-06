'use client'

import { useState } from 'react'

interface Props {
  onStart: () => void
}

const rules = [
  {
    step: 1,
    text: 'お互いに5枚のカードを引きます。カードは3回まで引き直し可能です。手持ちのカードのパワー合計が高いプレイヤーが先攻になります。',
  },
  {
    step: 2,
    text: '先攻のプレイヤーは手札からカードを1枚選んで場に出します。このとき後攻のプレイヤーにはカードのパワーは見えません。',
  },
  {
    step: 3,
    text: '後攻のプレイヤーは相手のカードを見て、自分の手札から1枚選んで場に出します。',
  },
  {
    step: 4,
    text: '両方のカードを戦わせます。パワーが高い方を出したプレイヤーが1ポイント獲得！パワーが同じ場合は引き分けです。',
  },
  {
    step: 5,
    text: '先攻と後攻を入れ替えて、お互いの手札がなくなるまでバトルを繰り返します。（全5ラウンド）',
  },
  {
    step: 6,
    text: '5ラウンド終了後、獲得ポイントが多いプレイヤーの勝ちです。',
  },
]

export default function TitleScreen({ onStart }: Props) {
  const [showRules, setShowRules] = useState(false)

  if (showRules) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d2444] flex flex-col items-center p-4">
        <div className="w-full max-w-lg mt-8">
          <h2 className="text-3xl font-bold text-yellow-400 text-center mb-2">ルール</h2>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
            <p className="text-gray-200 text-sm leading-relaxed mb-3">
              WikipediaカードバトルはWikipediaの記事で戦うカードバトルです。
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              カードにはパワーがあり、<span className="text-yellow-400 font-bold">Wikipediaの記事の情報量が多いほどパワーが高く</span>なります。
            </p>
          </div>

          <h3 className="text-white font-bold text-base mb-4 text-center tracking-wide">── ゲームの流れ ──</h3>

          <div className="flex flex-col gap-3 mb-8">
            {rules.map(rule => (
              <div key={rule.step} className="flex gap-3 items-start bg-white/5 border border-white/10 rounded-xl p-4">
                <span className="shrink-0 w-7 h-7 rounded-full bg-yellow-500 text-black font-bold text-sm flex items-center justify-center">
                  {rule.step}
                </span>
                <p className="text-gray-200 text-sm leading-relaxed">{rule.text}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowRules(false)}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
          >
            ← タイトルに戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0a1628] to-[#0d2444] p-4">
      <div className="text-center">
        <div className="text-7xl mb-4 animate-bounce">🃏</div>
        <h1 className="text-5xl font-bold text-yellow-400 mb-1 tracking-tight">Wikipedia</h1>
        <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">カードバトル</h2>
        <p className="text-gray-400 mb-2 text-sm max-w-xs mx-auto leading-relaxed">
          Wikipediaの記事情報を使ったカードバトルゲーム
        </p>
        <p className="text-gray-500 mb-12 text-xs max-w-xs mx-auto">
          記事の情報量がカードのパワーになる！
        </p>
        <button
          onClick={onStart}
          className="px-14 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl rounded-full transition-all transform hover:scale-105 shadow-xl"
        >
          ゲームスタート
        </button>
        <div className="mt-5">
          <button
            onClick={() => setShowRules(true)}
            className="text-gray-400 hover:text-white text-sm underline transition-colors"
          >
            ルールを見る
          </button>
        </div>
        <p className="text-gray-600 text-xs mt-6">CPU対戦モード</p>
      </div>
    </div>
  )
}
