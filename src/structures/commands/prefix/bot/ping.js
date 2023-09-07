import { Discloud, SaphireClient as client } from '../../../../classes/index.js'
import { ButtonStyle, Message, codeBlock } from 'discord.js'
import { Emojis as e } from '../../../../util/util.js'
import { socket } from '../../../../websocket/websocket.js'
import axios from 'axios'
import mongoose from 'mongoose'

export default {
    name: 'ping',
    description: 'Comando de ping',
    aliases: [],
    category: "bot",
    /**
     * @param { Message } message 
     */
    async execute(message, args) {

        if (['shard', 'shards'].includes(args[0])) return pingShard()

        const msg = await message.reply({ content: `${e.Loading} | Pinging...` })

        let toSubtract = Date.now()
        const replayPing = toSubtract - message.createdTimestamp
        const calculate = () => Date.now() - toSubtract

        const timeResponse = await Promise.all([
            Discloud.user.fetch().then(() => calculate()).catch(() => null),
            axios.get(client.url, { timeout: 10000 }).then(() => calculate()).catch(() => null),
            axios.get(client.apiUrl + "/ping", { timeout: 10000 }).then(() => calculate()).catch(() => null),
            socket?.timeout(10000).emitWithAck("ping", "ping").then(() => calculate()).catch(() => null),
            mongoose.connection?.db?.admin()?.ping().then(() => calculate()).catch(() => null),
            axios.get("https://top.gg/api/bots/912509487984812043", { headers: { authorization: process.env.TOP_GG_TOKEN }, timeout: 10000 }).then(() => calculate()).catch(() => null)
        ])

        const timeString = [
            `${e.discloud} | Discloud API Latency:`,
            `🌐 | Saphire Site Latency:`,
            `${e.api} | Saphire API Latency:`,
            `${e.websocket} | Saphire Websocket API Latency:`,
            `${e.Database} | Database Response Latency:`,
            `${e.topgg} | Top.gg API Latency:`
        ]

        const requests = timeResponse.map((value, i) => `${timeString[i]} ${emojiFormat(value)}`).join('\n')

        return msg.edit({
            content: `🧩 | **Shard ${client.shardId}/${(client.shard?.count - 1) || 0} [Cluster ${client.clusterName}]**\n⏱️ | ${Date.stringDate(client.uptime)}\n${e.slash} | ${client.interactions.currency() || 0} interações com ${client.messages.currency() || 0} mensagens\n⚡ | Interaction Response: ${emojiFormat(replayPing)}\n${e.discordLogo} | Discord Websocket Latency: ${emojiFormat(client.ws.ping)}\n${requests}`,
            embeds: [],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Atualizar',
                            emoji: '🔄',
                            custom_id: JSON.stringify({ c: 'ping', userId: message.author.id }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Bot Info',
                            emoji: "🔎",
                            custom_id: JSON.stringify({ c: 'botinfo', userId: message.author.id }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Shards',
                            emoji: '🧩',
                            custom_id: JSON.stringify({ c: 'ping', src: 'shard', userId: message.author.id }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Status',
                            emoji: '📊',
                            url: client.url + "/status",
                            style: ButtonStyle.Link
                        }
                    ]
                }
            ]
        }).catch(() => { })

        async function pingShard() {

            const shards = []

            const msg = await message.reply({ content: `${e.Loading} | Shards Pinging...` })

            const components = [
                {
                    type: 1,
                    components: [

                        {
                            type: 2,
                            label: 'Atualizar',
                            emoji: '🔄',
                            custom_id: JSON.stringify({ c: 'ping', src: 'shard', userId: message.author.id }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Bot Info',
                            emoji: "🔎",
                            custom_id: JSON.stringify({ c: 'botinfo', userId: message.author.id }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Ping',
                            emoji: '🏓',
                            custom_id: JSON.stringify({ c: 'ping', userId: message.author.id }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Status',
                            emoji: '📊',
                            url: client.url + "/status",
                            style: ButtonStyle.Link
                        }
                    ]
                }
            ]

            const shardsData = await socket
                .timeout(4000)
                .emitWithAck("getShardsData", "get")
                .catch(() => null)

            if (!shardsData)
                return msg.edit({
                    content: `${e.DenyX} | Não foi possível obter os dados das Shards... Tente novamente daqui a pouco.`,
                    components
                }).catch(() => { })

            shardsData.length = client.shard.count
            for (let i = 0; i < shardsData.length; i++) {
                const shard = shardsData[i]

                const data = {
                    id: (shard?.id ?? i),
                    status: shard?.ready ? 'Online' : 'Offline',
                    ping: (shard?.ms ?? '0') + 'ms',
                    guilds: shard?.guildsCount ?? 0,
                    users: shard?.usersCount ?? 0,
                    clusterName: shard?.clusterName ?? 'Offline'
                }

                shards.push(`${data?.id ?? '?'} | ${data.status} | ${data?.ping || 0} | Guilds: ${data?.guilds || 0} | Users: ${data?.users || 0} | Cluster: ${data?.clusterName || 'Desligado'}`)
            }

            const data = {
                content: `Shard ID: ${client.shardId}\n${codeBlock('txt', shards.join('\n') + `\n${shardsData.length !== client.shard.count ? 'Todas as Shards ainda não foram inicializadas' : ''}`)}`,
                components
            }

            return msg.edit(data).catch(() => { })
        }

        function emojiFormat(ms) {
            if (!ms) return "💔 Offline"

            const intervals = [800, 600, 400, 200, 0]
            const emojis = ["🔴", "🟤", "🟠", "🟡", "🟢", "🟣"]

            let emoji = "🟣"
            for (let i = 0; i < intervals.length; i++)
                if (ms >= intervals[i]) {
                    emoji = emojis[i]
                    break
                }

            return `${emoji} **${ms}**ms`
        }

    }
}