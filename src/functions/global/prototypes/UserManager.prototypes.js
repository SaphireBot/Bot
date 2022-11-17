import { UserManager, Routes, RouteBases } from 'discord.js'
import fetch from "node-fetch"

UserManager.prototype.fetch = async function (userId) {

    const UserInCache = this.cache.get(userId)
    if (UserInCache) return UserInCache

    const fetchUser = fetch(`${RouteBases.api + Routes.user(userId)}`, {
        headers: { Authorization: `Bot ${process.env.BOT_TOKEN_REQUEST}` },
        method: "GET"
    })
        .then(response => response.json())
        .catch(() => null)

    return fetchUser
}