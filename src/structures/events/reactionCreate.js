import { SaphireClient as client, Database } from '../../classes/index.js'
import votePoll from '../classes/buttons/poll/vote.poll.js'
import availableEmojis from './system/emojis.reactions.js'
import executeStars from './system/execute.stars.js'
const onCooldown = {}

client.on('messageReactionAdd', async (MessageReaction, user) => {

    const emojiName = MessageReaction?.emoji.name
    if (!MessageReaction || !user || user.bot || !availableEmojis.includes(emojiName)) return

    const message = MessageReaction.message.author === null
        ? await (async () => {
            const reactionFetched = await MessageReaction.fetch().catch(() => null)
            return reactionFetched?.message || null
        })()
        : MessageReaction?.message

    if (!message || !message.id) return

    if (emojiName === '⭐' && MessageReaction.count >= 2) {
        const guildData = await Database.Guild.findOne({ id: message.guild.id }, 'Stars')
        if (guildData?.Stars?.channel && !guildData.Stars?.sended?.some(data => data.messageId == message.id)) {
            if (onCooldown[message.channelId]) {
                setTimeout(() => {
                    executeStars({ MessageReaction, user, guildData, client })
                    delete onCooldown[message.channelId]
                }, 2000)
            } else {
                onCooldown[message.channelId] = true
                executeStars({ MessageReaction, user, guildData, client })
            }
        }
    }

    if (message.author.id !== client.user.id || !message.interaction) return

    if (message.interaction.commandName.includes('bet'))
        return client.emit('betReaction', { message, user, emojiName })

    if (message.interaction.commandName.includes('poll'))
        return votePoll({ message })
})