import { SaphireClient as client } from '../../classes/index.js'

client.on('shardCreate', () => {
    const allServers = client.shard.broadcastEval(c => c.guilds.cache.size)
    const serversCount = allServers.reduce((acc, guildSize) => acc + guildSize, 0)
    return client.user.setPresence({ activities: [{ name: `${client.slashCommands.size || 0} comandos em ${serversCount} servidores [Shard ${client.shard.ids.at(-1)}]` }], status: 'idle' })
})