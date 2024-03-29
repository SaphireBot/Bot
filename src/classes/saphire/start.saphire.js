import { Database, Discloud, SaphireClient as client, AfkManager, TempCallManager, ChestManager, SpamManager } from '../index.js';
import { Config } from '../../util/Constants.js';
import { Routes } from 'discord.js';
import { socket } from '../../websocket/websocket.js';
import automaticSystems from '../../functions/update/index.js';
import GiveawayManager from '../../functions/update/giveaway/manager.giveaway.js';
import slashCommand from '../../structures/handler/commands.handler.js';
import PollManager from '../../functions/update/polls/poll.manager.js';
import QuizManager from '../games/QuizManager.js';
import webhook from './webhooks.saphire.js';

export default async () => {
    console.log(`Shard ${client.shardId} | Starting Loading.`)

    process.env.TZ = "America/Sao_Paulo"
    await Discloud.login()

    if (
        client.shardId === 0
        && client.user.id == process.env.SAPHIRE_ID
    ) {
        const commands = await client.rest.get(Routes.applicationCommands(client.user.id)).catch(() => [])
        socket?.send({ type: "ApplicationCommandData", applicationCommandData: commands })
    }

    client.loadBlackList()

    client.clientData = await Database.Client.findOne({ id: client.user.id })
    Config.SpotifyAccessToken = client.clientData?.SpotifyAccessToken || 'undefined'
    Config.TwitchAccessToken = client.clientData?.TwitchAccessToken

    Database.Cache.clearTables(`${client.shardId}`)
    const guildsData = await Database.getGuilds(Array.from(client.guilds.cache.keys()))

    for (const data of guildsData)
        if (data?.Prefixes?.length)
            Database.Prefixes.set(data.id, data.Prefixes.filter(Boolean))

    GiveawayManager.load(guildsData)
    ChestManager.load(guildsData)
    PollManager.load(guildsData)
    TempCallManager.load(guildsData)
    SpamManager.load(guildsData)
    AfkManager.load()

    automaticSystems()

    Database.LanceGamesRefund()
    client.setCantadas()
    QuizManager.load()
    slashCommand()
    client.fanarts = await Database.Fanart.find() || []
    client.animes = await Database.Anime.find() || []
    Config.webhookAnimeReporter = await webhook(Config.quizAnimeAttachmentChannel)
    Config.webhookQuizReporter = await webhook(Config.questionSuggestionsSave)

    client.refreshStaff(true)
    return console.log(`Shard ${client.shardId} | Loading Complete.`)
}