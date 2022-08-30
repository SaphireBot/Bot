import { SaphireClient as client } from '../../classes/index.js'

client.on('messageReactionAdd', async (messageReaction, user) => {

    const availableEmojis = ['💸', '✅']
    const emojiName = messageReaction?.emoji?.name
    if (!user || user.bot || !availableEmojis.includes(emojiName)) return

    const message = messageReaction.message.author === null
        ? await (async () => {
            const reactionFetched = await messageReaction.fetch()
            return await reactionFetched.message
        })()
        : messageReaction.message

    if (message.author.id !== client.user.id || !message.interaction) return

    if (message.interaction.commandName.includes('bet'))
        return client.emit('betReaction', { message, user, emojiName })

})