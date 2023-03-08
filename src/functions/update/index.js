import { Database, Experience, SaphireClient as client } from '../../classes/index.js'
import Ranking from './ranking/index.ranking.js'
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export default async () => {

    await Ranking()
    client.refreshStaff()

    setInterval(async () => {
        client.fanarts = await Database.Fanart.find() || []
        client.refreshStaff()
        client.setMemes()
        client.setCantadas()
        Experience.set()
    }, 1000 * 60)

    setInterval(async () => {
        await client.guilds.all(false, true)
        delay(5000)
        client.user.setPresence({
            activities: [
                { name: `${client.slashCommands.size} comandos em ${client.allGuilds?.length || 0}  servidores [Shard ${client.shardId} in Cluster ${client.clusterName}]` }],
            status: 'idle'
        })
    }, 1000 * 60 * 5)

    setInterval(async () => await Ranking(), 60000 * 15)
    return
}