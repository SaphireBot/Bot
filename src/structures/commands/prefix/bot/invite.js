import { SaphireClient as client } from '../../../../classes/index.js';
import { Emojis as e } from '../../../../util/util.js';
import { Message } from 'discord.js';

export default {
    name: 'invite',
    description: 'Link de convite da Saphire',
    aliases: ['convite'],
    category: "Saphire",
    api_data: {
        tags: [],
        perms: { user: [], bot: [] }
    },
    /**
     * @param { Message } message
     * @param { string[] } args
     */
    async execute(message, args) {
        return message.reply({
            embeds: [{
                color: client.green,
                description: `${e.Animated.SaphireDance} Você pode me adicionar [clicando aqui](https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot%20applications.commands&permissions=2146958847).`
            }]
        })
    }
}