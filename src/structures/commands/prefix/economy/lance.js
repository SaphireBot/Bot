import { Message } from 'discord.js'
import { Emojis as e } from '../../../../util/util.js'

export default {
    name: 'lançar',
    description: 'Lance uma quantidade de Safiras no chat',
    aliases: ['lance'],
    category: "Economia",
    api_data: {
        tags: ['maintenance'],
        perms: { user: [], bot: [] }
    },
    /**
     * @param { Message } message
     * @param { string[] } args
     */
    async execute(message, args) {

        return message.reply({
            content: `${e.Loading} | Este comando está sob-construção.`
        })

    }
}