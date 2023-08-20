import { Socket as SocketType, io } from 'socket.io-client';
import { AfkManager, Database, GiveawayManager, SaphireClient as client } from '../classes/index.js';
import reward from './functions/topgg.reward.js';
import refreshRanking from '../functions/update/ranking/index.ranking.js';
import { commandsApi } from '../structures/handler/commands.handler.js';

/**
 * @type { SocketType }
 */
let socket;

function initSocket() {

    if (process.env.CANARY_ID == client.user.id) return

    let interval;

    socket = new io(
        `${process.env.WEBSOCKET_SAPHIRE_API_LOGIN_URL}`,
        {
            reconnectionDelayMax: 5000,
            auth: {
                token: `${process.env.WEBSOCKET_SAPHIRE_API_LOGIN_PASSWORD}`,
                shardId: client.shardId
            }
        }
    )

    socket.on("connect", () => initRefreshInterval())
    socket.on("disconnect", () => {
        if (interval) clearInterval(interval)
        console.log(`[WEBSOCKET] Shard ${client.shardId} - Disconnected`)
    })
    socket.on("error", error => console.log(`Shard ${client.shardId} | ERROR `, error))

    socket.on("getGiveaway", async (data, callback) => callback(await GiveawayManager.fetchGiveaway(data?.guildId, data?.giveawayId)))
    socket.on("getGuilds", (_, callback) => callback(client.guilds.cache.map(guild => ({ id: guild.id, name: guild.name }))))
    socket.on("message", message)
    socket.on("getGuild", fetchGuild)
    socket.on("commands", (_, callback) => callback(commandsApi))

    socket.on("shardsping", async (_, callback) => {
        const data = await client
            .shard
            .broadcastEval(client => ({ shard: client.shardId, ms: client.ws.ping, guilds: client.guilds.cache.size }))
            .catch(() => new Array(client.shard.count).fill(1).map((_, i) => ({ shard: i, ms: 0, guilds: 0 })))
        return callback(data)
    })

    socket.on("clientData", async (_, callback) => {
        const clientData = await Database.Client.findOne({ id: client.user.id })
        client.clientData = clientData
        return callback(clientData)
    })

    socket.on("getGuildAndGiveaway", async ({ guildId, giveawayId }, callback) => {

        if (
            !guildId
            || !giveawayId
            || !client.guilds.cache.has(guildId)
        ) return callback(null)

        const guild = client.guilds.cache.get(guildId)
        const guildMembers = await guild?.members?.fetch().catch(() => null)
        if (!guild || !guildMembers) callback(null)
        const giveaway = await GiveawayManager.fetchGiveaway(guildId, giveawayId)
        if (!giveaway) return callback(null)

        let participants = giveaway.Participants || []
        if (giveaway?.AllowedMembers?.length) participants.push(...giveaway?.AllowedMembers)
        if (giveaway?.LockedMembers?.length) participants.push(...giveaway?.LockedMembers)
        participants = Array.from(new Set(participants))

        const members = participants
            .filter(i => i)
            .flatMap(userId => {
                const member = guildMembers.get(userId)
                if (!member) return { username: "user#0000", id: userId }
                return { username: member?.user?.username || "user#0000", id: userId }
            })

        return callback({
            guild: {
                id: guild.id,
                name: guild.name,
                roles: guild.roles.cache.toJSON(),
                members
            },
            giveaway
        })
    })

    function initRefreshInterval() {
        if (interval) clearInterval(interval)
        send()
        interval = setInterval(() => send(), 1000 * 7)
        function send() {
            socket?.send({
                type: "shardStatus",
                shardData: {
                    shardId: client.shardId,
                    ready: client.isReady(),
                    ms: client.ws.ping || 0,
                    clusterName: client.clusterName,
                    guilds: client.guilds.cache.map(g => ({ name: g.name, id: g.id })),
                    guildsCount: client.guilds.cache.size || 0,
                    emojisCount: client.emojis.cache.size || 0,
                    channelsCount: client.channels.cache.size || 0,
                    usersCount: client.users.cache.size || 0
                }
            })
        }
    }

    return
}

export { socket, initSocket };

async function fetchGuild(guildId, callback) {
    return callback(null)
    try {
        return await client.fetchGuild(guildId)
    } catch (r) {
        return callback(null)
    }
}

function message(data) {
    if (!data?.type) return
    const { type, message } = data

    if (type == "refreshRanking") return refreshRanking()
    if (type == "console") return console.log(message)
    if (type == "topgg") return reward(message)
    if (type == "errorInPostingMessage") return client.errorInPostingMessage(data.data, data.err)
    if (type == "globalAfk") return globalAfkData(data.data)

    return console.log(`Shard ${client.shardId} | Unknown Message From Websocket | `, data)
}

function globalAfkData(data) {
    if (!data?.method) return
    if (data.method == 'save') return AfkManager.saveGlobal({ userId: data?.userId, message: data?.message })
    if (data.method == 'delete') return AfkManager.deleteGlobal(data?.userId)
    return
}