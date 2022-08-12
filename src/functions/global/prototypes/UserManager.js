import { UserManager } from 'discord.js'
import { SaphireClient as client } from '../../../classes/index.js'

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
UserManager.prototype.all = async (inFlat) => {
    const allUsers = await client.shard.broadcastEval(Client => Client.users.cache)
    return inFlat ? allUsers.flat() : allUsers
}