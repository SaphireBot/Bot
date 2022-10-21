import express from 'express'
import { Webhook } from '@top-gg/sdk'
import topggReward from '../functions/topgg/reward.js'
import recieveNewPaymentRequest from '../functions/donate/recieve.payment.js'
import { Database } from '../classes/index.js'
import connectDatabase from './functions/connect.database.js'
import getRanking from './functions/ranking.js'
import('dotenv/config')
const app = express()
const webhook = new Webhook(process.env.SAPHIRE_TOG_GG_AUTHORIZATION)

app.use(express.json())

app.get(process.env.ROUTE_BASE_DOMAIN, (_, res) => res.send('Ok'))

app.post(process.env.ROUTE_TOP_GG, webhook.listener(vote => topggReward(vote.user)))

app.post(process.env.ROUTE_MARCADO_PAGO_WEBHOOK, async (req, res) => {
  res.sendStatus(200)
  return recieveNewPaymentRequest(req.body)
})

app.get(process.env.ROUTE_DATABASE, (req, res, next) => {

  const auth = { login: process.env.DATABASE_USER_ACESS, password: process.env.DATABASE_PASSAWORD_ACESS }

  const [login, password] = Buffer.from(
    (req.headers.authorization || '').split(' ')[1] || '',
    'base64'
  )
    .toString()
    .split(':')

  if (login && password && login === auth.login && password === auth.password) {
    req.headers.authorization = null
    return next()
  }

  res.set('WWW-Authenticate', 'Basic realm="401"')
  res.status(401).send('Authentication required.')

})

app.get(process.env.ROUTE_DATABASE, async (_, res) => {
  const allData = await Database.Cache.General.all()
  return res.send(allData)
})

app.listen(8080, async () => {
  const dbConnect = await connectDatabase()
  console.log(`Saphire's API Connected | ${dbConnect}`)
})

app.get(process.env.ROUTE_RANKING, async (req, res) => {

  if (req.headers.auth !== process.env.RANKING_AUTHORIZATION)
    return res.sendStatus(500)

  return res.send(await getRanking().catch(() => null))
})

export default app