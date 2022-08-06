import express from 'express'
import { Webhook } from '@top-gg/sdk'
import topggReward from '../functions/topgg/reward.js'
const app = express()
const webhook = new Webhook(process.env.SAPHIRE_TOG_GG_AUTHORIZATION)

app.use(express.json())

app.get("/", (req, res) => res.send('Ok'))

app.post("/topgg", webhook.listener(vote => {
  return topggReward(vote.user)
}))

app.listen(8080, () => console.log('Saphire\'s API | OK!'))

export default app