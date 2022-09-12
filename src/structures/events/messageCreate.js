import {
    SaphireClient as client,
    Experience
} from '../../classes/index.js'

client.on('messageCreate', async message => {
    if (message.bot || !message.guild) return
    return Experience.addXp(message.author.id, 1)
})