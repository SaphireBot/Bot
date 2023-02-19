import slashCommand from '../../structures/handler/slashCommands.js'
import { Database, Discloud, SaphireClient as client } from '../index.js'
import automaticSystems from '../../functions/update/index.js'
import GiveawayManager from '../../functions/update/giveaway/manager.giveaway.js'
import PollManager from '../../functions/update/polls/poll.manager.js'
import managerReminder from '../../functions/update/reminder/manager.reminder.js'

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

    import('./process.saphire.js')
    console.log('1/14 - Process Handler Readed')

    import('../../structures/events/index.js')
    import('../../functions/global/prototypes.js')
    console.log('2/14 - Prototypes & Events Connected')

    await client.login()
    console.log('3/14 - Client Logged')

    const discloudResult = await Discloud.login()
        .then(() => "Discloud Host API Logged")
        .catch(() => "Discloud Host API Logged Failed")
    console.log('3/14 - ' + discloudResult)

    client.shardId = client.shard.ids.at(-1) || 0

    const databaseResponse = await Database.MongoConnect(client)
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
    await managerReminder.define()
    client.fanarts = await Database.Fanart.find() || []
    client.animes = await Database.Anime.find() || []
    import('./webhooks.saphire.js').then(file => file.default()).catch(() => { })
    console.log('11/14 - Cantadas/Memes/Lembretes/Fanarts/Webhooks Loaded')

    console.log(`12/14 - Connected at Shard ${client.shardId}`)
    import('../../api/app.js')

    await client.guilds.all(false, true)
    client.user.setPresence({
        activities: [
            { name: `${client.slashCommands.size} comandos em ${client.allGuilds?.length || 0}  servidores [Shard ${client.shardId} in Cluster ${client.clusterName}]` },
            { name: `Tentando entregar a melhor qualidade possível [Shard ${client.shardId} in Cluster ${client.clusterName}]` }
        ],
        status: 'idle'
    })

    return
}