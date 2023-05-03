import { Discloud, SaphireClient as client } from "../../../../classes/index.js"
import { ApplicationCommandOptionType, ButtonStyle, codeBlock, Status } from "discord.js"
import axios from "axios"
import mongoose from "mongoose"

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
    async execute({ interaction, e }, commandData) {

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
                }
            ]
        }

        toRefresh
            ? await interaction.update({ fetchReply: true, components: [button] })
            : await interaction.reply({ content: `${e.Loading} | Pinging...`, fetchReply: true, embeds: [] })

        let toSubtract = Date.now()
        const replayPing = toSubtract - interaction.createdTimestamp
        const calculate = () => Date.now() - toSubtract

        const timeResponse = await Promise.all([
            axios.get("https://ways.discloud.app/ping", { timeout: 10000 }).then(() => calculate()).catch(() => null),
            axios.get("https://top.gg/api/bots/912509487984812043", { headers: { authorization: process.env.TOP_GG_TOKEN }, timeout: 10000 }).then(() => calculate()).catch(() => null),
            axios.get("https://saphire.one", { timeout: 10000 }).then(() => calculate()).catch(() => null),
            Discloud.user.fetch().then(() => calculate()).catch(() => null),
            mongoose.connection?.db?.admin()?.ping().then(() => calculate()).catch(() => null)
        ])

        const timeString = [
            `${e.api} | Saphire API Latency:`,
            `${e.topgg} | Top.gg API Latency:`,
            `🌐 | Saphire Site Latency:`,
            `${e.discloud} | Discloud API Latency:`,
            `${e.Database} | Database Response Latency:`
        ]

        const requests = timeResponse.map((value, i) => `${timeString[i]} ${emojiFormat(value)}`).join('\n')

        const hourRemaingBattery = [
            { hour: [2, 3, 4, 5, 6], emoji: e.batteryComplete },
            { hour: [7, 8, 9, 10], emoji: e.batteryAlmostComplete },
            { hour: [11, 12, 13, 14], emoji: e.batteryDischarging },
            { hour: [15, 16, 17, 18], emoji: e.batteryMiddle },
            { hour: [19, 20, 21, 22], emoji: e.batteryEnding },
            { hour: [23, 24, 0, 1], emoji: e.batteryDying }
        ].find(data => data.hour.includes(new Date().getHours()))

        const { primary, accumulate } = client.uptimeAllTime
        const timeDifference = primary.valueOf() // 100% all time online
        let result = (timeDifference / (Date.now() - accumulate)) * 100
        if (result > 100) result = 100

        return await interaction.editReply({
            content: `🧩 | **Shard ${client.shardId + 1}/${client.shard?.count || 0} at Cluster ${client.clusterName}**\n⏱️ | ${Date.stringDate(client.uptime)} - (${result.toFixed(2)}%)\n${hourRemaingBattery.emoji} | ${Date.stringDate(client.twoAm - Date.now())} para o reinício\n${e.slash} | ${client.interactions.currency() || 0} interações com ${client.messages.currency() || 0} mensagens\n⚡ | Interaction Response: ${emojiFormat(replayPing)}\n${e.discordLogo} | Discord API Latency: ${emojiFormat(client.ws.ping)}\n${requests}`,
            embeds: [],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Atualizar',
                            emoji: '🔄',
                            custom_id: JSON.stringify({ c: 'ping' }),
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
                            custom_id: JSON.stringify({ c: 'ping', src: 'shard' }),
                            style: ButtonStyle.Primary
                        }
                    ]
                }
            ]
        }).catch(() => { })

        async function pingShard() {

            const shards = []

            const shardsData = await client.shard.broadcastEval(shard => ({
                id: shard.shardId,
                ping: shard.ws.ping,
                guilds: shard.guilds.cache.size,
                users: shard.users.cache.size,
                clusterName: shard.clusterName,
                status: shard.ws.status
            }))
                .catch(() => ([{
                    id: client.shardId,
                    ping: client.ws.ping,
                    guilds: client.guilds.cache.size,
                    users: client.users.cache.size,
                    clusterName: client.clusterName,
                    status: client.ws.status
                }]))

            shardsData.length = client.shard.count
            for (let i = 0; i < shardsData.length; i++) {
                const shard = shardsData[i]

                const data = {
                    id: (shard?.id ?? i) + 1,
                    status: Status[shard?.status] ?? 'Offline',
                    ping: (shard?.ping ?? '0') + 'ms',
                    guilds: shard?.guilds ?? 0,
                    users: shard?.users ?? 0,
                    clusterName: shard?.clusterName ?? 'Offline'
                }

                shards.push(`${data?.id ?? '?'} | ${data.status} | ${data?.ping || 0} | Guilds: ${data?.guilds || 0} | Users: ${data?.users || 0} | Cluster: ${data?.clusterName || 'Desligado'}`)
            }

            const data = {
                content: `Shard ID: ${client.shardId + 1}\n${codeBlock('txt', shards.join('\n') + `\n${shardsData.length !== client.shard.count ? 'Todas as Shards ainda não foram inicializadas' : ''}`)}`,
                components: [
                    {
                        type: 1,
                        components: [

                            {
                                type: 2,
                                label: 'Atualizar',
                                emoji: '🔄',
                                custom_id: JSON.stringify({ c: 'ping', src: 'shard' }),
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
                                custom_id: JSON.stringify({ c: 'ping' }),
                                style: ButtonStyle.Primary
                            }
                        ]
                    }
                ]
            }

            return commandData?.src
                ? await interaction.update(data).catch(() => { })
                : await interaction.reply(data)
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