import 'dotenv/config'
import { ShardManager as Shard } from './src/classes/index.js'
import Statcord from 'statcord.js'
// TODO: ATUALIZAR O STATCORD NO SISTEMA PRINCIPAL
const { ShardingClient } = Statcord
const { execArgv, env } = process

const ShardManager = new Shard('./index.js', { execArgv })

new ShardingClient({
    key: env.STATCORD_TOKEN,
    manager: ShardManager,
    postCpuStatistics: true,
    postMemStatistics: true,
    postNetworkStatistics: true,
    autopost: true
})

ShardManager.spawn({ amount: 'auto' })

export default ShardManager