const FEEDS = [
  { source: 'Cryptoast', url: 'https://cryptoast.fr/feed/' },
  { source: 'Journal du Coin', url: 'https://journalducoin.com/feed/' },
]

function extractTag(xml, tag) {
  const cdataMatch = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`).exec(xml)
  if (cdataMatch) return cdataMatch[1].trim()
  const plainMatch = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`).exec(xml)
  return plainMatch ? plainMatch[1].trim() : ''
}

function extractAttr(xml, tag, attr) {
  const match = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"[^>]*>`).exec(xml)
  return match ? match[1] : ''
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ' ').trim()
}

function parseRss(xml, source) {
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  const articles = []
  let match
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1]
    const title = stripHtml(extractTag(item, 'title'))
    const link = extractTag(item, 'link') || extractAttr(item, 'link', 'href')
    const pubDate = extractTag(item, 'pubDate')
    const description = stripHtml(extractTag(item, 'description')).slice(0, 200)
    const image =
      extractAttr(item, 'enclosure', 'url') ||
      extractAttr(item, 'media:content', 'url') ||
      extractAttr(item, 'media:thumbnail', 'url') ||
      ''
    if (title && link) {
      articles.push({ title, link, pubDate, description, image, source })
    }
  }
  return articles
}

/**
 * @param {import('fastify').FastifyInstance} app
 */
async function actusRoutes(app) {
  app.get('/', async (_request, reply) => {
    const results = await Promise.allSettled(
      FEEDS.map(async ({ source, url }) => {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
        if (!res.ok) throw new Error(`${source}: HTTP ${res.status}`)
        const xml = await res.text()
        return parseRss(xml, source)
      })
    )

    const articles = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 10)

    return reply.send({ articles })
  })
}

export default actusRoutes
