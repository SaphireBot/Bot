import { UserManager } from 'discord.js'
import { Database, SaphireClient as client } from '../../../classes/index.js'

UserManager.prototype.fetchUser = function (dataToSearch) {

    if (!dataToSearch) return null

    const search = client.allUsers
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

/**
 * @param Nothing
 * @returns Um array com todos os usuários de todas as Shards em cada array
 * @example <Client>.users.all() [[user1, user2, user3], [user4, user5, user6]]
 * @example <Client>.users.all(true) [user1, user2, user3, user4, user5, user6]
 */
UserManager.prototype.all = async (inFlat, toDefine) => {

    const looped = await Database.Cache.General.get('Looped')

    if (!looped) {
        await Database.Cache.General.set('Looped', true)
        for await (let guildRaw of client.allGuilds) {
            const guild = await client.guilds.fetch(guildRaw.id).catch(() => null)
            if (!guild) continue
            await guild.members.fetch()
            continue
        }
    }

    const data = await client.shard.broadcastEval(Client => Client.users.cache)
    if (toDefine) return client.allUsers = data.flat()
    return inFlat ? data.flat() : data
}