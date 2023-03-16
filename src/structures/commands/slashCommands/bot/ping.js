import { Discloud, SaphireClient as client } from "../../../../classes/index.js"
import { ApplicationCommandOptionType, ButtonStyle } from "discord.js"
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

        toRefresh
            ? await interaction.update({ content: `${e.Loading} | Atualizando Pinging....`, fetchReply: true, components: [] })
            : await interaction.reply({ content: `${e.Loading} | Pinging...`, fetchReply: true })

        const replayPing = Date.now() - interaction.createdAt.valueOf()
        let toSubtract = Date.now()
        const calculate = () => Date.now() - toSubtract

        const timeResponse = await Promise.all([
            axios.get("https://ways.discloud.app/ping", { timeout: 10000 }).then(() => calculate()).catch(() => null),
            axios.get("https://top.gg/api/bots/912509487984812043", { headers: { authorization: process.env.TOP_GG_TOKEN }, timeout: 10000 }).then(() => calculate()).catch(() => null),
            axios.get("https://saphire.one", { timeout: 10000 }).then(() => calculate()).catch(() => null),
            Discloud.user.fetch().then(() => calculate()).catch(() => null),
            mongoose.connection.db.admin().ping().then(() => calculate()).catch(() => null)
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
            content: `🧩 | **Shard ${client.shard.ids[0] + 1}/${client.shard.count || 0} at Cluster ${client.clusterName}**\n⏱️ | ${Date.stringDate(client.uptime)} - (${result.toFixed(2)}%)\n${hourRemaingBattery.emoji} | ${Date.stringDate(client.twoAm - Date.now())} para o reinício\n${e.slash} | ${client.interactions.currency() || 0} interações com ${client.messages.currency() || 0} mensagens\n⚡ | Interaction Response: ${emojiFormat(replayPing)}\n${e.discordLogo} | Discord API Latency: ${emojiFormat(client.ws.ping)}\n${requests}`,
            components: [
                {
                    type: 1,
                    components: [{
                        type: 2,
                        label: 'Atualizar',
                        emoji: '🔄',
                        custom_id: JSON.stringify({ c: 'ping' }),
                        style: ButtonStyle.Primary
                    }]
                }
            ]
        }).catch(() => { })

        async function pingShard() {
            const shardPings = client.ws.shards
                .map((shard, i) => `\`${i + 1}\` ${emojiFormat(shard.ping)}`)
                .join('\n')

            const data = {
                embeds: [{
                    color: client.blue,
                    title: `🧩 ${client.user.username}'s Shards`,
                    description: `${shardPings || 'Nenhum resultado encontrado'}`,
                    footer: {
                        text: `${client.shard.count} Shards at Cluster ${client.clusterName}`
                    }
                }],
                components: [
                    {
                        type: 1,
                        components: [{
                            type: 2,
                            label: 'Atualizar',
                            emoji: '🔄',
                            custom_id: JSON.stringify({ c: 'ping', src: 'shard' }),
                            style: ButtonStyle.Primary
                        }]
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