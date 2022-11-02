import axios from "axios"
import { Discloud } from "../../../../classes/index.js"
import mongoose from "mongoose"

export default {
    name: 'ping',
    description: '[bot] Comando de ping',
    dm_permission: false,
    type: 1,
    helpData: {
        description: 'Pong.'
    },
    options: [],
    async execute({ interaction, client, e }) {

        const loadingMessage = await interaction.reply({ content: `${e.Loading} | Pinging...`, fetchReply: true })
        const replayPing = loadingMessage.createdTimestamp - interaction.createdTimestamp
        let toSubtract = Date.now()

        const saphireAPI = await axios.get("https://ways.discloud.app/ping")
            .then(() => `**${Date.now() - toSubtract}**ms`)
            .catch(() => '*+9999*ms')

        toSubtract = Date.now()
        const discloudAPI = await Discloud.user.fetch()
            .then(() => `**${Date.now() - toSubtract}**ms`)
            .catch(() => '*+9999*ms')

        toSubtract = Date.now()
        const databasePing = await mongoose.connection.db.admin().ping()
            .then(() => `**${Date.now() - toSubtract}**ms`)
            .catch(() => '*+9999*ms')

        return interaction.editReply({
            content: `🧩 | **Shard ${client.shard.ids[0] + 1}/${client.shard.count || 0}** - ${Date.stringDate(client.uptime)}\n🤖 | Discord API Latency: **${client.ws.ping}**ms\n${e.discloud} | Discloud API Host: ${discloudAPI}\n${e.api} | Saphire API Connection: ${saphireAPI}\n${e.Database} | Database Latency: ${databasePing}\n⚡ | Interaction Response: **${replayPing}**ms`
        }).catch(() => { })
    }
}