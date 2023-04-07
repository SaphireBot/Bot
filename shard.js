import 'dotenv/config'
import ShardManager from './src/classes/saphire/manager.shard.js'
import Statcord from 'statcord.js'
import { execArgv } from 'process'
// TODO: ATUALIZAR O STATCORD NO SISTEMA PRINCIPAL
const { ShardingClient } = Statcord

const Shard = new ShardManager('./index.js', { execArgv, totalShards: 3, respawn: true, shardList: [0, 1, 2] })

new ShardingClient({
    key: process.env.STATCORD_TOKEN,
    manager: Shard,
    postCpuStatistics: true,
    postMemStatistics: true,
    postNetworkStatistics: true,
    autopost: true
})

Shard.spawn({ timeout: 1000 * 60 })

export default Shard