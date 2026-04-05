import { WikiCard } from '@/types/game'

interface WikiPage {
  pageid: number
  title: string
  revisions?: Array<{ size: number }>
}

interface WikiResponse {
  query?: {
    pages?: Record<string, WikiPage>
  }
}

export async function fetchRandomCards(count: number = 5): Promise<WikiCard[]> {
  const url = new URL('https://ja.wikipedia.org/w/api.php')
  url.searchParams.set('action', 'query')
  url.searchParams.set('generator', 'random')
  url.searchParams.set('grnnamespace', '0')
  url.searchParams.set('grnlimit', String(count + 2)) // 余分に取得して確保
  url.searchParams.set('prop', 'revisions')
  url.searchParams.set('rvprop', 'size')
  url.searchParams.set('format', 'json')
  url.searchParams.set('origin', '*')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Wikipedia API request failed')

  const data: WikiResponse = await res.json()
  const pages = data.query?.pages
  if (!pages) throw new Error('No pages returned')

  const cards: WikiCard[] = Object.values(pages)
    .filter(p => p.revisions?.[0]?.size != null && p.revisions[0].size > 0)
    .map(p => ({
      id: String(p.pageid),
      title: p.title,
      power: p.revisions![0].size,
    }))

  if (cards.length < count) {
    const extra = await fetchRandomCards(count - cards.length)
    return [...cards, ...extra].slice(0, count)
  }

  return cards.slice(0, count)
}
