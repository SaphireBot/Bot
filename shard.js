import './src/structures/handler/events.handler.js'
import './src/functions/global/prototypes.js'
import 'dotenv/config'
import ShardManager from './src/classes/saphire/manager.shard.js'
import Statcord from 'statcord.js'
import { execArgv } from 'process'
import { Database } from './src/classes/index.js'
Database.MongoConnect()

// TODO: ATUALIZAR O STATCORD NO SISTEMA PRINCIPAL
const { ShardingClient } = Statcord

// const Sharding = new ShardManager('./index.js', { execArgv, totalShards: 3, respawn: true, shardList: [0, 1, 2] })
const Sharding = new ShardManager('./index.js', { execArgv })

new ShardingClient({
    key: process.env.STATCORD_TOKEN,
    manager: Sharding,
    postCpuStatistics: true,
    postMemStatistics: true,
    postNetworkStatistics: true,
    autopost: true
})

// Sharding.on('shardCreate', Sharding.shardCreate)
Sharding.spawn({ timeout: 1000 * 60 })