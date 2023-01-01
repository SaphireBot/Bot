import { Database } from "../../../classes/index.js"

export default async ({ MessageReaction, guildData }) => {

    if (!guildData) return
    const { message, count } = MessageReaction
    const { author, guild, channel: messageChannel, content, attachments, id: messageId } = message
    const limit = guildData.Stars.limit || 0
    const channelId = guildData.Stars.channel || "0"
    const sended = guildData.Stars.sended || []

    if (author.bot || !channelId || limit < count || sended.find(data => data.messageId === messageId)) return

    const channel = await guild.channels.fetch(channelId).catch(() => null)
    if (!channel) return

    const formatAllowed = ['.jpg', '.gif', '.png', '.svg', 'webp']
    const attachment = attachments?.first()?.attachment

    if (attachment && !formatAllowed.includes(attachment.slice(-4))) return

    await Database.Guild.updateOne(
        { id: guild.id },
        { $push: { "Stars.sended": [{ userId: author.id, messageId }] } },
        { upsert: true }
    )

    return channel.send({
        content: `⭐ | ${messageChannel}`,
        embeds: [{
            color: 0xFFAC33,
            author: {
                name: author.tag,
                icon_url: author.avatarURL({ dynamic: true }),
                url: message.url,
            },
            description: `${content}`.limit('MessageEmbedDescription'),
            image: {
                url: attachment || null,
            }
        }]
    }).catch(() => { })

}