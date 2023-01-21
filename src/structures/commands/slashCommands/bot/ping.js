import { Discloud } from "../../../../classes/index.js"
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
    async execute({ interaction, client, e }, commandData) {

        const toRefresh = commandData?.c

        if (commandData?.src === 'shard') return pingShard()

        if (!toRefresh)
            if (interaction.options.getString('options') === 'shard') return pingShard()

        const loadingMessage = toRefresh
            ? await interaction.update({ content: `${e.Loading} | Atualizando Pinging....`, fetchReply: true, components: [] })
            : await interaction.reply({ content: `${e.Loading} | Pinging...`, fetchReply: true })

        const replayPing = toRefresh
            ? Date.now() - interaction.createdAt.valueOf()
            : loadingMessage.createdTimestamp - interaction.createdTimestamp

        let toSubtract = Date.now()

        const saphireAPI = await axios.get("https://ways.discloud.app/ping", { timeout: 10000 })
            .then(() => `${emojiFormat(Date.now() - toSubtract)}`)
            .catch(() => "🔴 Offline")

        toSubtract = Date.now()
        const topGG = await axios.get("https://top.gg/api/bots/912509487984812043",
            { headers: { authorization: process.env.TOP_GG_TOKEN }, timeout: 10000 })
            .then(() => `${emojiFormat(Date.now() - toSubtract)}`)
            .catch(() => "🔴 Offline")

        toSubtract = Date.now()
        const saphireSite = await axios.get("https://saphire.one", { timeout: 10000 })
            .then(() => `${emojiFormat(Date.now() - toSubtract)}`)
            // .catch(() => "🔴 Offline")
            .catch(() => "🛠 Em Construção")

        toSubtract = Date.now()
        const discloudAPI = await Discloud.user.fetch()
            .then(() => `${emojiFormat(Date.now() - toSubtract)}`)
            .catch(() => "🔴 Offline")

        toSubtract = Date.now()
        const databasePing = await mongoose.connection.db.admin().ping()
            .then(() => `${emojiFormat(Date.now() - toSubtract)}`)
            .catch(() => "🔴 Offline")

        return await interaction.editReply({
            content: `🧩 | **Shard ${client.shard.ids[0] + 1}/${client.shard.count || 0} at Cluster ${client.clusterName}**\n⏱️ | ${Date.stringDate(client.uptime)}\n💓 | ${client.Heartbeat} WS Discord Pinging Counter\n${e.slash} | Interações: ${client.interactions || 0}\n${e.topgg} | Top.gg API Latency: ${discloudAPI}\n${e.api} | Saphire API Latency: ${saphireAPI}\n🌐 | Saphire Site Latency: ${saphireSite}\n${e.Database} | Database Response Latency: ${databasePing}\n⚡ | Interaction Response: ${emojiFormat(replayPing)}`,
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
        })

        async function pingShard() {
            const shardPings = client.ws.shards
                .map((shard, i) => `\`${i}\` ${emojiFormat(shard.ping)}`)
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
            if (!ms) return "🔴 Offline"
            if (ms > 800) return `🟤 **${ms}**ms`

            return ms < 250
                ? `🟢 **${ms}**ms`.replace('-', '')
                : `🟠 **${ms}**ms`.replace('-', '')
        }

    }
}