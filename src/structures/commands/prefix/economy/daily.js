import { Message } from 'discord.js'
import Daily from '../../slash/economy/daily/new.daily.js'

export default {
    name: 'daily',
    description: 'Pegue uma recompensa diária todos os dias',
    aliases: ['diário'],
    category: "Economia",
    api_data: {
        tags: [],
        perms: { user: [], bot: [] }
    },
    /**
     * @param { Message } message
     * @param { string[] } args
     */
    async execute(message, args) {
        return new Daily({}, message).executePrefixCommand(message, args)
    }
}