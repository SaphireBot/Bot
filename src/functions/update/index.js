import { Database, SaphireClient as client } from '../../classes/index.js'
import ReminderSystem from './reminder/index.js'
import Ranking from './ranking/index.ranking.js'
// const boostReward = require('../server/boostReward')
// const RaffleSystem = require('../update/rifasystem')

export default async () => {

    await Ranking()
    await client.guilds.all(true, true)
    client.users.all(true, true)

    setInterval(() => {
        ReminderSystem()
        // RaffleSystem()
    }, 3000)

    setInterval(async () => {
        client.allGuilds = await client.guilds.all(true)
        client.allUsers = await client.users.all(true)
        const allDataUsers = await Database.User.find({})
        client.allUsersData = allDataUsers.map(data => data.id)
    }, 60000 * 5)

    // setInterval(() => boostReward(), 60000)
    if (client.shardId === 0) setInterval(async () => await Ranking(), 60000 * 15)
    // setInterval(() => {
    //     client.user.setActivity(`${client.commands.size + client.slashCommands.size} comandos em ${client.guilds.cache.size} servidores`, { type: 'PLAYING' })
    // }, 300000)

    const allDataUsers = await Database.User.find({})
    client.allUsersData = allDataUsers.map(data => data.id)

}