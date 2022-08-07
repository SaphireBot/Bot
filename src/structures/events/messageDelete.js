import {
    Database,
    SaphireClient as client
} from '../../classes/index.js'

client.on('messageDelete', async message => {

    if (!message?.id) return

    const isWordleGame = await Database.Cache.WordleGame.get(message.id)
    if (isWordleGame)
        await Database.Cache.WordleGame.delete(message.id)

    // TODO: Terminar aqui
    // const Giveaways = await Database.Cache.Giveaways.get(`${client.shardId}.Giveaways.${message.guild.id}`)
    // if (Giveaways?.includes(data => data.MessageID === message.id)) {
    //     await Database.Cache.Giveaways.pull(`${client.shardId}.Giveaways`, data => data.MessageID === message.id)
    //     Database.deleteGiveaway(message.id, message.guild.id)
    // }

    return
})