import express from 'express'
import YoutubeMusicApi from 'youtube-music-api'
import { getDataFromYoutubeMusicVideoId } from './track.service.js'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import 'dotenv/config'

const api = new YoutubeMusicApi()

const app = express()

app.use(express.json())
app.use(morgan('combined'))
app.use(helmet())
app.use(cors())

app.post('/track', async (req, res) => {
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

  api.initalize()
    .then(_info => {
      api.search(query, 'song').then((data) => {
        return res.json(data.content.map((item) => {
          const thumbnail = item.thumbnails.length > 1 ? item.thumbnails.pop().url : null

          return {
            url: 'https://www.youtube.com/watch?v=' + item.videoId,
            title: item.name,
            artist: item.artist.name,
            banner: thumbnail,
            duration: item.duration / 1000
          }
        }
        ))
      })
    })
    .catch(err => {
      console.log(err)
      return res.status(500).json({ error: err })
    })
})

app.post('/playlist', (req, res) => {
  const playlistId = req.body.playlist

  api.initalize()
    .then(_info => {
      api.getPlaylist(playlistId).then((data) => {
        return res.json(data)
      })
    })
    .catch(err => {
      console.log(err)
      return res.status(500).json({ error: err })
    })
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}!`)
})
