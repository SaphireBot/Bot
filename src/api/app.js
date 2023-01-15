import express from 'express'
import topggReward from '../functions/topgg/reward.js'
import axios from 'axios'
import { SaphireClient as client } from '../classes/index.js'
import { Emojis as e } from '../util/util.js'
import os from 'os'
const hostName = os.hostname()
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

app.use(express.json())

app.post(`${process.env.ROUTE_TOP_GG}`, async (req, res) => {

  if (req.headers?.authorization !== process.env.TOP_GG_ACCESS)
    return res
      .send({
        status: 401,
        response: "Authorization is not defined correctly."
      });

  if (!req.headers?.user)
    return res.status(206).send('A partial content was given.')

  const response = await topggReward(req.headers?.user || null).catch(() => null)

  try {
    return response
      ? res.status(200)
        .header(response)
        .send()
      : res.sendStatus(204)
  } catch (err) { }
})

app.get(`${process.env.ROUTE_COMMANDS}`, async (req, res) => {

  if (req.headers?.authorization !== process.env.COMMAND_ACCESS)
    return res
      .send({
        status: 401,
        response: "Authorization is not defined correctly."
      });

  return res
    .send(client?.slashCommandsData || [])

})

app.get(`${process.env.ROUTE_ALL_GUILDS}`, async (req, res) => {

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

app.get(`${process.env.ROUTE_ALL_USERS}`, async (req, res) => {

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

app.use((_, res) => res.status(404).send({ status: 404, message: "Route Not Found" }))

const system = {
  RodrigoPC: {
    name: 'LocalHost',
    port: 1000
  },
  '52bd375d84ce': {
    name: 'Discloud',
    port: 8080
  },
  'squarecloud.app': {
    name: 'Squarecloud',
    port: 80
  }
}[hostName]

app.listen(system?.port || 8080, "0.0.0.0", () => alertLogin(system.name || "Discloud"))

export default app

async function alertLogin(host) {

  if (host === 'LocalHost')
    return console.log('Online em LocalHost')

  if (!host) {
    console.clear()
    return process.exit(10)
  }

  console.log('13/14 - Saphire\'s Local API Connected')

  return await axios({
    url: 'https://ways.discloud.app/online',
    data: {
      authorization: process.env.LOGIN_ACCESS,
      host: host
    },
    method: "POST"
  })
    .then(async value => {

      if (value.data.continue === "Logout") {
        console.clear()

        client.sendWebhook(
          process.env.WEBHOOK_STATUS,
          {
            username: `[${client.canaryId === client.user.id ? 'Saphire Canary' : 'Saphire'}] Try to connect`,
            content: `Tentativa de login na **${system.name}**. Efetuando desligamento por duplicidade.`
          }
        )

        return process.exit(11)
      }

      const webhookResponse = await client.sendWebhook(
        process.env.WEBHOOK_STATUS,
        {
          username: `[${client.canaryId === client.user.id ? 'Saphire Canary' : 'Saphire'}] Connection Status`,
          content: `${e.Check} | **Shard ${client.shardId} in Cluster ${client.clusterName} Online**\n📅 | ${new Date().toLocaleString("pt-BR").replace(" ", " ás ")}\n${e.cpu} | Processo iniciado na Host ${host}\n📝 | H.O.S Name: ${hostName}`
        }
      )

      if (webhookResponse === true)
        console.log('14/14 - Webhook Responded Successfully')
      else console.log('14/14 - Webhook Not Responded\n ' + webhookResponse)

    })
    .catch(err => console.log(err))
}