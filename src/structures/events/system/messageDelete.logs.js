import { AuditLogEvent } from "discord.js"
import { Emojis as e } from "../../../util/util.js"
import {
    Database,
    SaphireClient as client
} from "../../../classes/index.js"

export default async message => {
    if (message.partial) return
    const { guild, author, type } = message
    if (type !== 0 || author?.bot) return

    const guildData = await Database.Guild.findOne({ id: guild.id }, "LogSystem")
    const auditIds = await Database.Cache.General.get(`${client.shardId}.AudityLogsId`) || []
    if (!guildData || !guildData.LogSystem?.channel || !guildData.LogSystem?.messages?.active) return

    const channel = await guild.channels.fetch(guildData.LogSystem?.channel).catch(() => null)
    if (!channel) return

    const auditory = await guild.fetchAuditLogs({ type: AuditLogEvent.MessageDelete }).catch(() => null)
    if (!auditory) return

    const firstEntry = auditory?.entries?.first()
    let { executor, id: auditId } = firstEntry

    if (auditIds.includes(auditId))
        executor = author

    const embeds = [{
        color: client.blue,
        title: "Dados da mensagem deletada",
        description: `Esta mensagem foi apagada no canal ${message.channel}`,
        fields: [
            {
                name: '👤 Autor(a)',
                value: `- ${author?.tag || "Not Found"} - \`${author?.id || 0}\``
            },
            {
                name: `${e.ModShield} Quem apagou`,
                value: `- ${executor?.tag || "Not Found"} - \`${executor?.id}\`\n- ${Date.Timestamp()}`
            }
        ]
    }]

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

    if (!embeds[0].fields[2] && !embeds[1]) return
    await Database.Cache.General.push(`${client.shardId}.AudityLogsId`, auditId)

    return channel?.send({ content: `🛰️ | **Global System Notification** | Message Delete`, embeds }).catch(() => { })
}