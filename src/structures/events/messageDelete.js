import {
    Database,
    SaphireClient as client
} from '../../classes/index.js'

client.on('messageDelete', async message => {

    if (!message?.id) return

    const isWordleGame = await Database.Cache.WordleGame.get(message.id)
    if (isWordleGame) await Database.Cache.WordleGame.delete(message.id)

    const cachedData = await Database.Cache.General.get(`${client.shardId}.TopGG`)
    if (cachedData?.find(data => data.messageId === message.id))
        await Database.Cache.General.pull(`${client.shardId}.TopGG`, data => data.messageId === message.id)

    if (message.interaction) {
        const user = message.interaction.user
        const memoryGameData = await Database.Cache.Memory.get(user.id)
        if (memoryGameData)
            return await Database.Cache.Memory.pull(user.id, value => value.id === message.id)
    }

    // TODO: Terminar aqui
    // const Giveaways = await Database.Cache.Giveaways.get(`${client.shardId}.Giveaways.${message.guild.id}`)
    // if (Giveaways?.includes(data => data.MessageID === message.id)) {
    //     await Database.Cache.Giveaways.pull(`${client.shardId}.Giveaways`, data => data.MessageID === message.id)
    //     Database.deleteGiveaway(message.id, message.guild.id)
    // }

    return
})
