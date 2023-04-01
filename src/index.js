import express from 'express'
import YoutubeMusicApi from 'youtube-music-api'
import { getDataFromYoutubeMusicVideoId } from './services/track.service.js'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import 'dotenv/config'

const app = express()

app.use(express.json())
app.use(morgan('combined'))
app.use(helmet())
app.use(cors())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')

  next()
})

app.post('/track', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const trackId = req.body.track

  try {
    const data = await getDataFromYoutubeMusicVideoId({ id: trackId })

    res.status(200).json(data)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error })
  }
})

app.post('/search', (req, res) => {
  const query = req.body.query
  const queryType = req.body.type
  const api = new YoutubeMusicApi()

  try {
    api
      .initalize()
      .then((_info) => {
        api.search(query, queryType || 'song', 1)
          .then((data) => {
            const result = data.content.map((item) => {
              const thumbnail = item.thumbnails.length > 1 ? item.thumbnails.pop().url : null

              return {
                id: item.videoId,
                url: 'https://www.youtube.com/watch?v=' + item.videoId,
                title: item.name,
                artist: item.artist.name,
                banner: thumbnail,
                duration: item.duration / 1000
              }
            })

            return res.json(result.length > 20 ? result.slice(0, 20) : result)
          })
          .catch(() => {
            return res.status(500).json({ error: 'error' })
          })
      }).catch(() => {
        return res.status(500).json({ error: 'error' })
      })
  } catch (error) {
    console.log(query)
    return res.status(500).json({ error: 'error' })
  }
})

app.post('/playlist', (req, res) => {
  const api = new YoutubeMusicApi()
  const playlistId = req.body.playlist

  api
    .initalize()
    .then((_info) => {
      api.getPlaylist(playlistId).then((data) => {
        return res.json(data)
      })
    })
    .catch((err) => {
      console.log(err)
      return res.status(500).json({ error: err })
    })
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}!`)
})
