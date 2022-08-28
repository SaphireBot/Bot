// import { SaphireClient as client, Database } from '../../classes/index.js'
import ReminderSystem from './reminder/index.js'
// const TopGlobalRanking = require('../update/TopGlobalRanking')
// const boostReward = require('../server/boostReward')
// const RaffleSystem = require('../update/rifasystem')

export default () => {

    // TopGlobalRanking()

    setInterval(() => {
        ReminderSystem()
        // RaffleSystem()
    }, 3000)

    // setInterval(() => boostReward(), 60000)
    // setInterval(() => TopGlobalRanking(), 1800000)
    // setInterval(() => {
    //     client.user.setActivity(`${client.commands.size + client.slashCommands.size} comandos em ${client.guilds.cache.size} servidores`, { type: 'PLAYING' })
    // }, 300000)
}