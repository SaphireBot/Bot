import slashCommand from '../../structures/handler/slashCommands.js'
import automaticSystems from '../../functions/update/index.js'
import GiveawayManager from '../../functions/update/giveaway/manager.giveaway.js'
import PollManager from '../../functions/update/polls/poll.manager.js'
import managerReminder from '../../functions/update/reminder/manager.reminder.js'
import QuizManager from '../games/QuizManager.js'
import webhook from './webhooks.saphire.js'
import { Database, Discloud, SaphireClient as client, TwitchManager } from '../index.js'
import { Config } from '../../util/Constants.js'

export default async () => {

    process.env.TZ = "America/Sao_Paulo"
    import('../../structures/handler/events.handler.js')
    import('../../functions/global/prototypes.js')
    await client.login()
    Discloud.login()

    Database.MongoConnect()
    slashCommand(client)
    Database.Cache.clearTables(`${client.shardId}`)
    GiveawayManager.setGiveaways()
    PollManager.set()

    automaticSystems()

    client.setCantadas()
    client.setMemes()
    client.refreshStaff()
    managerReminder.load()
    QuizManager.load()
    client.fanarts = await Database.Fanart.find() || []
    client.animes = await Database.Anime.find() || []
    import('./webhooks.saphire.js').then(file => file.default()).catch(() => { })
    Config.webhookAnimeReporter = await webhook(Config.quizAnimeAttachmentChannel)
    Config.webhookQuizReporter = await webhook(Config.questionSuggestionsSave)

    console.log(`Shard ${client.shardId} is ready and was started.`)

    if (client.shardId == 0) {
        import('../../api/app.js')
        TwitchManager.load()
    }

    client.user.setPresence({
        activities: [
            { name: `${client.slashCommands.size} comandos incríveis\n[Shard ${client.shardId}/${client.shard.count} in Cluster ${client.clusterName}]` }
        ],
        status: 'idle',
        shardId: client.shardId
    })

    return client.calculateReload()
}