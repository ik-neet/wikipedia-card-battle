'use client'
import { useState } from 'react'

interface Props {
  text: string
}

const SITE_URL = 'https://wikipedia-card-battle.vercel.app'

export default function ShareButtons({ text }: Props) {
  const [copied, setCopied] = useState(false)

  const encodedText = encodeURIComponent(text)
  const encodedUrl = encodeURIComponent(SITE_URL)

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedText}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${text}\n${SITE_URL}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-3 mb-4">
      <p className="text-gray-400 text-xs">結果をシェアする</p>
      <div className="flex gap-3">
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-bold rounded-full transition-all"
        >
          𝕏 でシェア
        </a>
        <a
          href={lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-[#06C755] hover:bg-[#05b54d] text-white text-sm font-bold rounded-full transition-all"
        >
          LINE でシェア
        </a>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold rounded-full transition-all"
        >
          {copied ? 'コピーしました！' : 'コピー'}
        </button>
      </div>
    </div>
  )
}
