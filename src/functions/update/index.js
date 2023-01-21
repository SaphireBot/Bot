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
        Experience.setExperience()

        client.user.setPresence({
            activities: [
                { name: `${this.slashCommands.size} comandos em ${this.allGuilds?.length || 0}  servidores [Shard ${this.shardId} in Cluster ${this.clusterName}]` }],
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