import { Database, SaphireClient as client } from '../../classes/index.js'
import ReminderSystem from './reminder/index.js'
import Ranking from './ranking/index.ranking.js'
// const boostReward = require('../server/boostReward')
// const RaffleSystem = require('../update/rifasystem')

export default () => {

    Ranking()

    setInterval(() => {
        ReminderSystem()
        // RaffleSystem()
    }, 3000)

    // setInterval(() => boostReward(), 60000)
    if (client.shardId === 0) setInterval(() => Ranking(), 1800000)
    // setInterval(() => {
    //     client.user.setActivity(`${client.commands.size + client.slashCommands.size} comandos em ${client.guilds.cache.size} servidores`, { type: 'PLAYING' })
    // }, 300000)

}