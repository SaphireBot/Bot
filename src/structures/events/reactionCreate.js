import { SaphireClient as client, Database } from '../../classes/index.js'
// import executeTranslate from '../../functions/plugins/execute.translate.js'
import votePoll from '../classes/buttons/poll/vote.poll.js'
import availableEmojis from './system/emojis.reactions.js'
import executeStars from './system/execute.stars.js'

client.on('messageReactionAdd', async (MessageReaction, user) => {

    const emojiName = MessageReaction?.emoji.name
    if (!user || user.bot || !availableEmojis.includes(emojiName)) return

    const message = MessageReaction.message.author === null
        ? await (async () => {
            const reactionFetched = await MessageReaction.fetch()
            return await reactionFetched.message
        })()
        : MessageReaction.message

    if (emojiName === '⭐' && MessageReaction.count >= 2) {
        const guildData = await Database.Guild.findOne({ id: message.guild.id }, 'Stars')
        if (guildData?.Stars?.channel)
            executeStars({ MessageReaction, user, guildData, client })
    }

    if (message.author.id !== client.user.id || !message.interaction) return

    if (message.interaction.commandName.includes('bet'))
        return client.emit('betReaction', { message, user, emojiName })

    if (message.interaction.commandName.includes('poll'))
        return votePoll({ message })
})