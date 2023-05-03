import { Database, SaphireClient as client } from "../../../classes/index.js"
import { AuditLogEvent, Message } from "discord.js"
import { Emojis as e } from "../../../util/util.js"

/**
 * @param { Message } message
 */
export default async message => {

    if (message.partial) return

    const { guild, author, type } = message
    if (type !== 0 || author?.bot) return

    // const guildData = await Database.Guild.findOne({ id: guild.id }, "LogSystem")
    const guildData = await Database.getGuild(guild.id)
    if (!guildData || !guildData.LogSystem?.channel || !guildData.LogSystem?.messages?.active) return

    const auditory = await guild.fetchAuditLogs({ type: AuditLogEvent.MessageDelete }).catch(() => null)
    if (!auditory) return

    const entry = auditory?.entries?.first()
    const lastId = await Database.Cache.General.get(`${guild.id}.LastEntriesID`)
    let { executor } = entry
    if (lastId == entry?.id) executor = author
    await Database.Cache.General.set(`${guild.id}.LastEntriesID`, entry.id)

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

    if (message.content)
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

    if (message.attachments.size)
        embeds[0].fields.push({
            name: '🖼️ Mídias/Arquivos',
            value: `${message.attachments.size} mídias nesta mensagem`
        })

    if (message.pinned)
        embeds[0].fields.push({
            name: '📌 Mensagem Fixada',
            value: 'Esta era uma mensagem fixada'
        })

    return client.pushMessage({
        channelId: guildData.LogSystem?.channel,
        method: 'post',
        guildId: guild.id,
        LogType: 'messages',
        body: {
            content: `🛰️ | **Global System Notification** | Message Delete`, embeds
        }
    })
}