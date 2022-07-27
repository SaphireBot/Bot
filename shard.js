import 'dotenv/config'
import { ShardManager as Shard } from './src/classes/index.js'
// import Statcord from 'statcord.js'

// const { ShardingClient } = Statcord
const { execArgv, env } = process

const ShardManager = new Shard('./index.js', { execArgv })

// new ShardingClient({
//     key: env.STATCORD_KEY,
//     manager: ShardManager,
//     postCpuStatistics: true,
//     postMemStatistics: true,
//     postNetworkStatistics: true,
//     autopost: true
// })

ShardManager.spawn({ amount: 'auto' })

export default ShardManager