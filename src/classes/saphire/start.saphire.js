import slashCommand from '../../structures/handler/slashCommands.js'
import automaticSystems from '../../functions/update/index.js'
import GiveawayManager from '../../functions/update/giveaway/manager.giveaway.js'
import PollManager from '../../functions/update/polls/poll.manager.js'
import managerReminder from '../../functions/update/reminder/manager.reminder.js'
import Socket from './websocket.saphire.js'
import QuizManager from '../games/QuizManager.js'
import webhook from './webhooks.saphire.js'
import { Database, Discloud, SaphireClient as client } from '../index.js'
import { Config } from '../../util/Constants.js'
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * @param Nothing
 * Leitura dos prototypes e eventos
 * 
 * Login do Client e Database
 * 
 * Registro dos SlashCommands
 * 
 * Shard 0 - Exclusão do Cache
 * 
 * Console Log da Shard
 */
export default async () => {

    process.env.TZ = "America/Sao_Paulo"
    await import('./process.saphire.js')

    console.log('1/14 - Process Handler Readed')

    import('../../structures/events/index.js')
    import('../../functions/global/prototypes.js')
    console.log('2/14 - Prototypes & Events Connected')

    await client.login().then(() => console.log('Client Logged'))

    const discloudResult = await Discloud.login()
        .then(() => "Discloud Host API Logged")
        .catch(() => "Discloud Host API Logged Failed")
    console.log('3/14 - ' + discloudResult)

    client.shardId = client.shard.ids.at(-1) || 0

    console.log('4/14 - Tentiva de Websocket Connection')
    client.socket = new Socket(client.shardId || 0).enableListeners()

    const databaseResponse = await Database.MongoConnect()
    console.log('5/14 - ' + databaseResponse)

    const slashCommandsResponse = await slashCommand(client)
    console.log('6/14 - ' + slashCommandsResponse)

    await Database.Cache.clearTables(`${client.shardId}`)
    console.log('7/14 - Cache\'s Tables Cleaned')

    await GiveawayManager.setGiveaways()
    console.log('8/14 - Giveaways System Started')

    await PollManager.set()
    console.log('9/14 - Polls System Started')

    automaticSystems()
    console.log('10/14 - Automatic System Started')

    await client.setCantadas()
    await client.setMemes()
    await client.refreshStaff()
    await managerReminder.define()
    await QuizManager.load()
    client.fanarts = await Database.Fanart.find() || []
    client.animes = await Database.Anime.find() || []
    import('./webhooks.saphire.js').then(file => file.default()).catch(() => { })
    Config.webhookAnimeReporter = await webhook(Config.quizAnimeAttachmentChannel)
    Config.webhookQuizReporter = await webhook(Config.questionSuggestionsSave)
    console.log('11/14 - Cantadas/Memes/Lembretes/Fanarts/Webhooks/Quiz Loaded')

    console.log(`12/14 - Connected at Shard ${client.shardId}`)
    import('../../api/app.js')

    await client.guilds.all(false, true)
    delay(5000)
    client.user.setPresence({
        activities: [
            { name: `${client.slashCommands.size} comandos em ${client.allGuilds?.length || 0} servidores\n[Shard ${client.shardId + 1}/${client.ws.shards.size} in Cluster ${client.clusterName}]` }
        ],
        status: 'idle'
    })

    return client.calculateReload()
}