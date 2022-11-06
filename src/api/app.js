import express from 'express'
import topggReward from '../functions/topgg/reward.js'
import recieveNewPaymentRequest from '../functions/donate/recieve.payment.js'
import { SaphireClient as client } from '../classes/index.js'
import('dotenv/config')

const app = express()

app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Max-Age", 3600)
  next();
})

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

app.get("/commands", async (req, res) => {

  if (req.headers?.authorization !== process.env.COMMAND_ACCESS)
    return res
      .send({
        status: 401,
        response: "Authorization is not defined correctly."
      });

  return res
    .send(client?.slashCommandsData || [])

})

app.get("/allGuilds", async (req, res) => {

  if (req.headers?.authorization !== process.env.ALL_GUILDS_ACCESS)
    return res
      .send({
        status: 401,
        response: "Authorization is not defined correctly."
      });

  const allGuilds = await client.shard.fetchClientValues('guilds.cache').catch(() => [])
  const ids = allGuilds?.flat()?.map(guild => guild?.id) || []

  return res
    .status(200)
    .send(ids || [])

})

app.get("/allUsers", async (req, res) => {

  if (req.headers?.authorization !== process.env.ALL_USERS_ACCESS)
    return res
      .send({
        status: 401,
        response: "Authorization is not defined correctly."
      });

  const allUsers = await client.shard.fetchClientValues('users.cache').catch(() => [])
  const ids = allUsers?.flat()?.map(user => user?.id) || []

  return res
    .status(200)
    .send(ids || [])

})

app.get("/", async (_, res) => res.status(200).send({ status: "Online" }))

app.listen(8080, async () => console.log('Saphire\'s Local API Connected'))

export default app