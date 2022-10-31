import { GuildManager } from 'discord.js'
import { SaphireClient as client } from '../../../classes/index.js'

GuildManager.prototype.fetchGuild = async function (dataToSearch) {

    if (!dataToSearch) return null

    const allGuilds = await client.shard.broadcastEval(Client => Client.guilds.cache)

    const search = allGuilds
        .flat()
        .find(data => {
            return data.id === dataToSearch
                || data.name?.toLowerCase() === dataToSearch?.toLowerCase()
        })

    if (!search) return null

    return client.guilds.resolve(search?.id) || null
}

/**
 * @param Nothing
 * @returns Um array com todos os servidores de todas as Shards em cada array
 * @example <Client>.guilds.all() [[guild1, guild2, guild3], [guild4, guild5, guild6]]
 * @example <Client>.guilds.all(true) [guild1, guild2, guild3, guild4, guild5, guild6]
 */
GuildManager.prototype.all = async (inFlat, toDefine) => {
    const allGuilds = await client.shard.fetchClientValues('guilds.cache')
    if (toDefine) return client.allGuilds = allGuilds.flat()
    return inFlat ? allGuilds.flat() : allGuilds
}