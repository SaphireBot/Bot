import { Database, Experience, SaphireClient as client } from '../../classes/index.js'
import Ranking from './ranking/index.ranking.js'

export default async () => {

    Ranking()
    client.refreshStaff()

    setInterval(async () => {
        client.fanarts = await Database.Fanart.find() || []
        client.refreshStaff()
        client.setMemes()
        client.setCantadas()
        Experience.set()

        client.uptimeAllTime.accumulate += 1000 * 60
        await Database.Client.updateOne(
            { id: client.user.id },
            { $inc: { 'uptime.accumulate': 1000 * 60 } }
        )

    }, 1000 * 60)

    setInterval(async () => {

        const guilds = await client.shard.broadcastEval(Client => Client.guilds.cache.size).catch(() => [client.guilds.cache.size])
        if (!guilds || !guilds?.length || !Array.isArray(guilds)) return
        const size = guilds.reduce((prev, cur) => prev += cur, 0)

        client.user.setPresence({
            activities: [
                { name: `${client.slashCommands.size} comandos em ${size} servidores\n[Shard ${client.shardId + 1}/${client.shard.count} in Cluster ${client.clusterName}]` }],
            status: 'idle',
            shardId: client.shardId
        })
    }, 1000 * 60 * 5)

    setInterval(async () => await Ranking(), 60000 * 15)
    return
}