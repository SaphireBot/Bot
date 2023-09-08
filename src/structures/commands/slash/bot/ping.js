import { Discloud, SaphireClient as client } from "../../../../classes/index.js"
import { ApplicationCommandOptionType, ButtonStyle, codeBlock, Status } from "discord.js"
import axios from "axios"
import mongoose from "mongoose"
import { Emojis as e } from "../../../../util/util.js"
import { socket } from "../../../../websocket/websocket.js"

export default {
    name: 'ping',
    description: '[bot] Comando de ping',
    category: "bot",
    dm_permission: false,
    database: false,
    type: 1,
    helpData: {
        description: 'Pong.'
    },
    options: [
        {
            name: 'options',
            description: 'Opções do comando ping',
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'Ping das Shards',
                    value: 'shard'
                }
            ]
        }
    ],
    apiData: {
        name: "ping",
        description: "Veja um resumo de todas as conexões da Saphire",
        category: "Saphire",
        synonyms: [],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction }, commandData) {

        const toRefresh = commandData?.c
        if (commandData?.src === 'shard') return pingShard()

        if (!toRefresh)
            if (interaction.options.getString('options') === 'shard') return pingShard()

        const button = {
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Atualizando...',
                    emoji: e.Loading,
                    custom_id: 'refreshing',
                    style: ButtonStyle.Primary,
                    disabled: true
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

        toRefresh
            ? await interaction.update({ fetchReply: true, components: [button] }).catch(() => { })
            : await interaction.reply({ content: `${e.Loading} | Pinging...`, fetchReply: true, embeds: [] })

        let toSubtract = Date.now()
        const replayPing = toSubtract - interaction.createdTimestamp
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

        return await interaction.editReply({
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
                            custom_id: JSON.stringify({ c: 'ping', userId: interaction.user.id }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Bot Info',
                            emoji: "🔎",
                            custom_id: JSON.stringify({ c: 'botinfo', userId: interaction.user.id }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Shards',
                            emoji: '🧩',
                            custom_id: JSON.stringify({ c: 'ping', src: 'shard', userId: interaction.user.id }),
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

            commandData?.src
                ? await interaction.update({ content: `${e.Loading} | Obtendo dados das Shards`, embeds: [], components: [] }).catch(() => { })
                : await interaction.reply({ content: `${e.Loading} | Obtendo dados das Shards`, embeds: [], components: [] })

            const components = [
                {
                    type: 1,
                    components: [

                        {
                            type: 2,
                            label: 'Atualizar',
                            emoji: '🔄',
                            custom_id: JSON.stringify({ c: 'ping', src: 'shard', userId: interaction.user.id }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Bot Info',
                            emoji: "🔎",
                            custom_id: JSON.stringify({ c: 'botinfo', userId: interaction.user.id }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Ping',
                            emoji: '🏓',
                            custom_id: JSON.stringify({ c: 'ping', userId: interaction.user.id }),
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
                return interaction.editReply({
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

            return interaction.editReply(data).catch(() => { })
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