import express from 'express'
import topggReward from '../functions/topgg/reward.js'
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

  return response
    ? res.status(200).header(response).send()
    : res.sendStatus(204)
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

// Discloud
app.listen(8080, "0.0.0.0", async () => console.log('14/14 - Saphire\'s Local API Connected'))

// Squarecloud
// app.listen(80, "0.0.0.0", async () => console.log('14/14 - Saphire\'s Local API Connected'))

export default app