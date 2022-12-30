import { UserManager, Routes, RouteBases, User } from 'discord.js'
import { SaphireClient as client } from '../../../classes/index.js'
import fetch from "node-fetch"

// UserManager.prototype.fetch = async function (userId) {

//     if (!userId) return

//     const UserInCache = this.cache.get(userId)
//     if (UserInCache) return UserInCache

//     const fetchUser = await fetch(`${RouteBases.api + Routes.user(userId)}`, {
//         headers: { Authorization: `Bot ${process.env.BOT_TOKEN_REQUEST}` },
//         method: "GET"
//     })
//         .then(response => response.json())
//         .catch(() => null)

//     if (!fetchUser) return
//     return new User(client, fetchUser)
// }