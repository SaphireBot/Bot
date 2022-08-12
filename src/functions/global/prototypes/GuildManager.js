import { GuildManager } from 'discord.js'
import { SaphireClient as client } from '../../../classes/index.js'

GuildManager.prototype.fetchGuild = async function (dataToSearch) {

    if (!dataToSearch) return null

    const allUsers = await client.shard.broadcastEval(Client => Client.users.cache)

    const search = allUsers
        .flat()
        .find(data => {
            return data.id === dataToSearch
                || data.username?.toLowerCase() === dataToSearch?.toLowerCase()
                || data.tag?.toLowerCase() === dataToSearch?.toLowerCase()
                || data.discriminator === dataToSearch
                || data.username?.toLowerCase()?.includes(dataToSearch?.toLowerCase())
                || data.tag?.toLowerCase()?.includes(dataToSearch?.toLowerCase())
        })

    return client.users.resolve(search.id) || null
}