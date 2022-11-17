import { Database, Experience, SaphireClient as client } from '../../classes/index.js'
import ReminderSystem from './reminder/index.js'
import Ranking from './ranking/index.ranking.js'

export default async () => {

    await Ranking()
    client.refreshStaff()

    setInterval(async () => {
        ReminderSystem()
        client.fanarts = await Database.Fanart.find() || []
    }, 3000)

    setInterval(async () => {
        const allDataUsers = await Database.User.find({})
        client.databaseUsers = allDataUsers.map(data => data.id)
    }, 60000 * 5)

    setInterval(() => Experience.setExperience(), 1000 * 30)

    if (client.shardId === 0) setInterval(async () => await Ranking(), 60000 * 15)

    setInterval(async () => {
        const guildsLength = await client.allGuildsData() || []
        client.refreshStaff()
        return client.user.setPresence({
            activities: [
                { name: `${client.slashCommands.size} comandos em ${guildsLength?.flat().length} servidores [Shard ${client.shardId}]` }
            ],
            status: 'idle'
        })
    }, 300000)

    const allDataUsers = await Database.User.find({})
    client.databaseUsers = allDataUsers.map(data => data.id)

}