import('dotenv/config');
import { SaphireClient as client } from '../classes/index.js';
import { Emojis as e } from '../util/util.js';
import { Config } from '../util/Constants.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as linkedRole from './linkedRoles.api.js';
import * as storage from './storage.api.js';
import os from 'os';
import express from 'express';
import cookieParser from 'cookie-parser';
import topggPost from './functions/topgg.post.js';
import slashcommandsGet from './functions/slashcommands.get.js';
import animesFromDB from './functions/animes.get.js';
import cantadasFromDB from './functions/cantadas.get.js';
import clientFromDB from './functions/client.get.js';
import economiesFromDB from './functions/economies.get.js';
import fanartsFromDB from './functions/fanarts.get.js';
import guildsFromDB from './functions/guilds.get.js';
import indicationsFromDB from './functions/indications.get.js';
import memesFromDB from './functions/memes.get.js';
import rathersFromDB from './functions/rathers.get.js';
import remindersFromDB from './functions/reminders.get.js';
import usersFromDB from './functions/users.get.js';
import quizFromDB from './functions/quiz.get.js';
const __dirname = dirname(fileURLToPath(import.meta.url))
const hostName = os.hostname()
const system = {
  name: hostName === 'RodrigoPC' ? 'RodrigoPC' : 'Discloud',
  port: hostName === 'RodrigoPC' ? 1000 : 8080
}

const app = express()

app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Max-Age", 3600)
  res.setHeader("Cache-Control", "no-store, no-cache")
  next();
})

app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(express.json())

app.get(`${process.env.ROUTE_LINKED_ROLES}`, (_, res) => {
  const { url, state } = linkedRole.getOAuthUrl();
  res.cookie('clientState', state, { maxAge: 1000 * 60 * 5, signed: true });
  return res.redirect(url);
})

app.get('/add', (_, res) => {
  return res.redirect('https://discord.com/oauth2/authorize?client_id=912509487984812043&scope=bot%20applications.commands&permissions=2146958847')
})

app.get(`${process.env.ROUTE_LINKED_ROLES_CALLBACK}`, async (req, res) => {
  const code = req.query['code'];
  const discordState = req.query['state'];

  if (req.signedCookies?.clientState !== discordState)
    return res.send({
      status: 403,
      message: 'Unauthorized | Access Denied | Acesso Negado'
    });

  const tokens = await linkedRole.getOAuthTokens(code);
  if (!tokens) return res.send({ message: "Dados não obtidos ou expirados." })

  const meData = await linkedRole.getUserData(tokens);
  const userId = meData.user.id;
  await storage.storeDiscordTokens(userId, {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: Date.now() + tokens.expires_in * 1000,
  });

  const response = await linkedRole.updateMetadata(userId);
  if (response == 'success') return res.sendFile(__dirname + '/html/success.linkedroles.html');
  return res.sendFile(__dirname + '/html/fail.linkedroles.html');
})

app.post(`${process.env.ROUTE_TOP_GG}`, topggPost)
app.get(`${process.env.ROUTE_COMMANDS}`, slashcommandsGet)

// Backup Database Routes
app.get(`${process.env.ROUTE_ANIMES_FROM_DATABASE}`, animesFromDB)
app.get(`${process.env.ROUTE_CANTADAS_FROM_DATABASE}`, cantadasFromDB)
app.get(`${process.env.ROUTE_CLIENTS_FROM_DATABASE}`, clientFromDB)
app.get(`${process.env.ROUTE_ECONOMIES_FROM_DATABASE}`, economiesFromDB)
app.get(`${process.env.ROUTE_FANARTS_FROM_DATABASE}`, fanartsFromDB)
app.get(`${process.env.ROUTE_GUILDS_FROM_DATABASE}`, guildsFromDB)
app.get(`${process.env.ROUTE_INDICATIONS_FROM_DATABASE}`, indicationsFromDB)
app.get(`${process.env.ROUTE_MEMES_FROM_DATABASE}`, memesFromDB)
app.get(`${process.env.ROUTE_RATHERS_FROM_DATABASE}`, rathersFromDB)
app.get(`${process.env.ROUTE_REMINDERS_FROM_DATABASE}`, remindersFromDB)
app.get(`${process.env.ROUTE_USERS_FROM_DATABASE}`, usersFromDB)
app.get("quiz", quizFromDB)

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

app.listen(system.port || process.env.SERVER_PORT, "0.0.0.0", () => alertLogin(system?.name))

export default app

async function alertLogin(host) {

  if (!host) {
    console.clear()
    return process.exit(10)
  }

  console.log('Local API Connected')

  return client.pushMessage({
    method: 'post',
    type: 'initing',
    body: {
      content: `${e.Check} | **Shard ${client.shardId} in Cluster ${client.clusterName} Online**\n📅 | ${new Date().toLocaleString("pt-BR").replace(" ", " ás ")}\n${e.cpu} | Processo iniciado na Host ${host}\n📝 | H.O.S Name: ${hostName}`
    },
    channelId: Config.statusChannelNotification
  })

}