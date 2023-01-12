import axios from "axios"
import { Discloud } from "../../../../classes/index.js"
import mongoose from "mongoose"
import { ButtonStyle } from "discord.js"

export default {
    name: 'ping',
    description: '[bot] Comando de ping',
    category: "bot",
    dm_permission: false,
    type: 1,
    helpData: {
        description: 'Pong.'
    },
    options: [],
    async execute({ interaction, client, e }, toRefresh) {

        const loadingMessage = toRefresh
            ? await interaction.update({ content: `${e.Loading} | Atualizando Pinging....`, fetchReply: true, components: [] })
            : await interaction.reply({ content: `${e.Loading} | Pinging...`, fetchReply: true })

        const replayPing = toRefresh
            ? Date.now() - interaction.createdAt.valueOf()
            : loadingMessage.createdTimestamp - interaction.createdTimestamp

        function emojiFormat(ms) {
            if (!ms) return "🔴 Offline"
            if (ms > 800) return `🟤 **${ms}**ms`

            return ms < 250
                ? `🟢 **${ms}**ms`
                : `🟠 **${ms}**ms`
        }

        let toSubtract = Date.now()

        const saphireAPI = await axios.get("https://ways.discloud.app/ping", { timeout: 10000 })
            .then(() => `${emojiFormat(Date.now() - toSubtract)}`)
            .catch(() => "🔴 Offline")

        toSubtract = Date.now()
        const saphireSite = await axios.get("https://saphire.one", { timeout: 10000 })
            .then(() => `${emojiFormat(Date.now() - toSubtract)}`)
            // .catch(() => "🔴 Offline")
            .catch(() => "🛠 Em Construção")

        toSubtract = Date.now()
        const Squarecloud = await axios.get("https://api.squarecloud.app/v1/public/stats", { timeout: 10000 })
            .then(() => `${emojiFormat(Date.now() - toSubtract)}`)
            .catch(() => "🔴 Offline")

        toSubtract = Date.now()
        const discloudAPI = await Discloud.user.fetch()
            .then(() => `${emojiFormat(Date.now() - toSubtract)}`)
            .catch(() => "🔴 Offline")

        toSubtract = Date.now()
        const databasePing = await mongoose.connection.db.admin().ping()
            .then(() => `${emojiFormat(Date.now() - toSubtract)}`)
            .catch(() => "🔴 Offline")

        return await interaction.editReply({
            content: `🧩 | **Shard ${client.shard.ids[0] + 1}/${client.shard.count || 0} at Cluster Safira**\n⏱️ | ${Date.stringDate(client.uptime)}\n💓 | ${client.Heartbeat} WS Discord Pinging\n${e.slash} | Interações: ${client.interactions || 0}\n${e.discordLogo} | Discord API Latency: ${emojiFormat(client.ws.ping)}\n🔳 | SquareCloud API Host: ${Squarecloud}\n${e.discloud} | Discloud API Host: ${discloudAPI}\n${e.api} | Saphire API Latency: ${saphireAPI}\n🌐 | Saphire Site Latency: ${saphireSite}\n${e.Database} | Database Latency: ${databasePing}\n⚡ | Interaction Response: ${emojiFormat(replayPing)}`,
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
    }
}