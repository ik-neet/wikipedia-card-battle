interface Props {
  onStart: () => void
}

export default function TitleScreen({ onStart }: Props) {
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
          記事のサイズがカードのパワーになる！
        </p>
        <button
          onClick={onStart}
          className="px-14 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl rounded-full transition-all transform hover:scale-105 shadow-xl"
        >
          ゲームスタート
        </button>
        <p className="text-gray-600 text-xs mt-8">CPU対戦モード</p>
      </div>
    </div>
  )
}
