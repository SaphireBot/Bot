import 'dotenv/config'
import ShardingManager from './src/classes/saphire/manager.shard.js'
import Statcord from 'statcord.js'
import { execArgv, env } from 'process'
import { Database, SaphireClient as client } from './src/classes/index.js'
const shardList = {
    discloud: [...new Array(Math.floor(Math.random() * 8) + 2).keys()],
    localhost: [0, 1]
}[process.env.MACHINE] || [0]

const { ShardingClient } = Statcord

const Manager = new ShardingManager('./index.js', {
    execArgv,
    token: env.DISCORD_TOKEN,
    totalShards: shardList.length,
    shardList,
    respawn: true
})

console.log(`[SHARD MANAGER] Loading ${Manager.totalShards} Shards`)

new ShardingClient({
    key: process.env.STATCORD_TOKEN,
    manager: Manager,
    postCpuStatistics: true,
    postMemStatistics: true,
    postNetworkStatistics: true,
    autopost: true
})

Manager.on('shardCreate', shard => console.log(`Shard ${shard.id} | Lauched.`));

Manager.spawn()
    .then(async shards => {

        shards.forEach(Manager.enableListeners)
        setInterval(() => Database.Cache.Chat.delete("Global"), 1000 * 60 * 60)
        if (client.clusterName == "Antares") return
        const guildsPerShards = await Manager.fetchClientValues("guilds.cache.size").catch(() => null)
        if (!guildsPerShards?.length) return
        await fetch(
            `https://top.gg/api/bots/${process.env.SAPHIRE_ID}/stats`,
            {
                method: "POST",
                headers: {
                    authorization: process.env.TOP_GG_TOKEN,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    server_count: guildsPerShards.reduce((pre, curr) => pre += curr, 0) || 0,
                    shards: guildsPerShards || [0],
                    shard_count: Manager.totalShards || 0
                })
            }
        )
            .then(res => {
                if (res.ok) return console.log("[TOP.GG] Status posted.")
                return console.log("[TOP.GG] Fail to post status's bot.")
            })
            .catch(err => console.log("[TOP.GG ERROR]", err))

        return
    })
    .catch(console.error);