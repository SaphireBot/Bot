import express from 'express'
import topggReward from '../functions/topgg/reward.js'
import recieveNewPaymentRequest from '../functions/donate/recieve.payment.js'
import connectDatabase from './functions/connect.database.js'
import('dotenv/config')
const app = express()

app.use(express.json())

app.post(process.env.ROUTE_TOP_GG, async (req, res) => {

  const response = await topggReward(req.headers?.user || null)

  return response
    ? res.status(200).header(response).send(response)
    : res.sendStatus(500)
})

app.post(process.env.ROUTE_MARCADO_PAGO_WEBHOOK, async (req, res) => {
  res.sendStatus(200)
  return recieveNewPaymentRequest(req.body)
})

app.listen(8080, async () => {
  const dbConnect = await connectDatabase()
  console.log(`Saphire's Local API Connected | ${dbConnect}`)
})

export default app