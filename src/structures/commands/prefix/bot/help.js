import { Message } from 'discord.js'
import { Emojis as e } from '../../../../util/util.js'
import { SaphireClient as client } from '../../../../classes/index.js'

export default {
    name: 'help',
    description: '[bot] Comando de ajuda da Saphire',
    aliases: ['h', 'ajuda', 'commands', 'comandos'],
    category: "bot",
    /**
     * @param { Message } message
     */
    async execute(message) {
        return message.reply({
            content: `${e.Animated.SaphireReading} | Você pode ver todos os meus comandos no meu site: ${client.url}/comandos`
        })
    }
}