import { Database, Experience, SaphireClient as client } from '../../classes/index.js'
import Ranking from './ranking/index.ranking.js'

export default async () => {

    await Ranking()
    client.refreshStaff()

    setInterval(async () => {
        client.fanarts = await Database.Fanart.find() || []
        client.refreshStaff()
        client.setMemes()
        client.setCantadas()
        Experience.set()

        client.user.setPresence({
            activities: [
                { name: `${client.slashCommands.size} comandos em ${client.allGuilds?.length || 0}  servidores [Shard ${client.shardId} in Cluster ${client.clusterName}]` }],
            status: 'idle'
        })

    }, 60000)

    setInterval(async () => {
        const allDataUsers = await Database.User.find({})
        client.databaseUsers = allDataUsers.map(data => data.id)
    }, 60000 * 5)

    setInterval(async () => await Ranking(), 60000 * 15)

    const allDataUsers = await Database.User.find({})
    client.databaseUsers = allDataUsers.map(data => data.id)

    return
}