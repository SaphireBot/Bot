import express from 'express'
import { Webhook } from '@top-gg/sdk'
import topggReward from '../functions/topgg/reward.js'
import recieveNewPaymentRequest from '../functions/donate/recieve.payment.js'
import { Database } from '../classes/index.js'
import Routes from './Routes.js'
import('dotenv/config')
const app = express()
const webhook = new Webhook(process.env.SAPHIRE_TOG_GG_AUTHORIZATION)

app.use(express.json())

app.get(Routes.General, (req, res) => res.send('Ok'))

app.post(Routes.TopGG, webhook.listener(vote => topggReward(vote.user)))

app.post(Routes.MercadoPagoWebhook, async (req, res) => {
  res.sendStatus(200)
  return recieveNewPaymentRequest(req.body)
})

app.get(Routes.Database, (req, res, next) => {

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

app.get(Routes.Database, async (req, res) => {
  const allData = await Database.Cache.General.all()
  return res.send(allData)
})

app.listen(8080, () => console.log('Saphire\'s API | OK!'))

export default app