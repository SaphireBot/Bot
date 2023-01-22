import {
    SaphireClient as client,
    Experience
} from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'
import afkSystem from './system/afk.system.js'

client.on('messageCreate', async message => {

    if (message?.author?.bot || !message.guild || message.webhookId) return
    Experience.add(message.author.id, 1)

    afkSystem(message)

    if (message.content === `<@${client.user.id}>`)
        return message.reply({
            content: `${e.saphirePolicial} | Opa, tudo bem? Meus comandos estão 100% em /slashCommand. Veja alguns deles usando \`/help\``
        }).catch(() => { })

    return Experience.add(message.author.id, 1)
})