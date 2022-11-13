import {
    SaphireClient as client,
    Experience
} from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'

client.on('messageCreate', async message => {
        
    if (message?.author?.bot || !message.guild) return
    Experience.addXp(message.author.id, 1)
    
    if (message.content?.includes(client.user.id))
        return message.reply({
            content: `${e.saphirePolicial} | Opa, tudo bem? Meus comandos estão 100% em /slashCommand. Veja alguns deles usando \`/help\``
        }).catch(() => { })

    return Experience.addXp(message.author.id, 1)
})