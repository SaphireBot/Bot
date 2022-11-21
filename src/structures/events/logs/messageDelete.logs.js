import { AuditLogEvent } from "discord.js"
import { Emojis as e } from "../../../util/util.js"
import {
    Database,
    SaphireClient as client
} from "../../../classes/index.js"

export default async message => {

    const { guild, author, type } = message
    if (type !== 0 || author?.bot) return

    const guildData = await Database.Guild.findOne({ id: guild.id }, "LogSystem")
    if (!guildData || !guildData.LogSystem?.channel || !guildData.LogSystem?.messages?.active) return

    const channel = await guild.channels.fetch(guildData.LogSystem?.channel).catch(() => null)
    if (!channel) return

    const auditory = await guild.fetchAuditLogs({ type: AuditLogEvent.MessageDelete, limit: 1 }).catch(() => null)
    const firstEntry = auditory?.entries?.first()
    const { executor, target } = firstEntry

    const embeds = [
        {
            color: client.blue,
            title: "Dados da mensagem deletada",
            description: `Esta mensagem foi apagada no canal ${message.channel}`,
            fields: [
                {
                    name: '👤 Autor(a)',
                    value: `- ${target?.tag || "Not Found"} - \`${target?.id}\``
                },
                {
                    name: `${e.ModShield} Quem apagou`,
                    value: `- ${executor?.tag || "Not Found"} - \`${executor?.id}\``
                }
            ]
        }
    ]

    if (message.content) {
        if (message.content?.length <= 1018)
            embeds[0].fields.push({
                name: '📝 Conteúdo',
                value: `\`\`\`${message.content?.slice(0, 1018)}\`\`\``
            })
        else embeds.push({
            color: client.blue,
            title: '📝 Conteúdo',
            description: `\`\`\`${message.content?.slice(0, 4090)?.limit('MessageEmbedDescription')}\`\`\``
        })
    }

    return channel?.send({ content: `🛰️ | **Global System Notification** | Message Delete`, embeds }).catch(() => { })
}