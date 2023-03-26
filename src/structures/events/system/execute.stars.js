import { Database } from "../../../classes/index.js"

export default async ({ MessageReaction, guildData }) => {

    if (!guildData) return
    const { message, count } = MessageReaction
    if (guildData.Stars?.sended?.some(data => data.messageId == message.id)) return
    const { author, guild, channel: messageChannel, content, attachments, id: messageId } = message
    const limit = guildData.Stars.limit || 0
    const channelId = guildData.Stars.channel || "0"
    const sended = guildData.Stars.sended || []

    if (
        limit < 2
        || author.bot
        || !channelId
        || count < limit
        || sended.some(data => data.messageId === messageId)
    ) return

    const channel = await guild.channels.fetch(channelId).catch(() => null)
    if (!channel) return

    const formatAllowed = ['.jpg', '.gif', '.png', '.svg', 'webp']
    const attachAvailable = attachments.filter(attach => formatAllowed.includes(attach?.attachment.slice(-4))).toJSON() || []

    const embeds = [{
        color: 0xFFAC33,
        author: {
            name: author.tag,
            icon_url: author.avatarURL({ forceStatic: false }),
            url: message.url,
        },
        description: `${content}`.limit('MessageEmbedDescription'),
        image: {
            url: attachAvailable[0]?.attachment || null,
        }
    }]

    if (attachAvailable.length)
        for (const attach of attachAvailable) {
            if (attach.id === attachAvailable[0].id) continue
            embeds.push({
                color: 0xFFAC33,
                image: {
                    url: attach?.attachment || null,
                }
            })
        }

    if (embeds.length >= 10) embeds.length = 10

    return channel.send({ content: `⭐ | ${messageChannel}`, embeds })
        .then(async () => await Database.Guild.updateOne(
            { id: guild.id },
            { $push: { "Stars.sended": { userId: author.id, messageId } } },
            { upsert: true }
        ))
        .catch(() => { })

}