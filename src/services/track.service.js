import * as cheerio from 'cheerio'

export function validationYoutubeMusicVideoUrl (url) {
  const musicRegex = /https:\/\/music.youtube.com\/watch\?v=([a-zA-Z0-9_-]{11})/

  const listRegex = /https:\/\/music.youtube.com\/playlist\?list=([a-zA-Z0-9_-]{34})/

  if (musicRegex.test(url)) {
    return 'track'
  }

  if (listRegex.test(url)) {
    return 'playlist'
  }

  return false
}

export function convertIdVideoToUrl (id) {
  return `https://music.youtube.com/watch?v=${id}`
}

export function convertIdVideoToUrlPlaylist (id) {
  return `https://music.youtube.com/playlist?list=${id}`
}

export function extractIdVideoFromUrl (url) {
  const regex = /https:\/\/music.youtube.com\/watch\?v=([a-zA-Z0-9_-]{11})/

  const match = url.match(regex)

  if (match) {
    const id = match[1]
    return id
  }

  return null
}

export function scrapingTrack ({ html }) {
  const $ = cheerio.load(html)

  const title = $('meta[property="og:title"]').attr('content')
  const description = $('meta[property="og:description"]').attr('content')
  const artist = $('meta[property="og:description"]').attr('content')
  const duration = $('meta[itemprop="duration"]').attr('content')
  const thumbnail = $('meta[property="og:image"]').attr('content')

  return {
    title,
    description,
    artist,
    duration,
    banner: thumbnail
  }
}

export async function getDataFromYoutubeMusicVideoId ({ id }) {
  const url = convertIdVideoToUrl(id)

  const validation = validationYoutubeMusicVideoUrl(url)

  if (!validation) {
    throw new Error('Invalid url')
  }

  if (validation === 'playlist') {
    throw new Error('Invalid url')
  }

  const response = await fetch(url)
  const html = await response.text()

  return scrapingTrack({ html })
}
