import { ButtonStyle, Message } from 'discord.js'
import { Emojis as e } from '../../../../util/util.js'

export default {
    name: 'connect4',
    description: 'O clássico Connect4, só que no Discord',
    aliases: [],
    category: "games",
    /**
     * @param { Message } message
     * @param { string[] } args
     */
    async execute(message, args) {

        const member = await message.getMember(args[0])

        if (
            !member
            || member.user.id == message.author.id
            || member.user.bot
        ) return message.reply({ content: `${e.Deny} | Opa opa, selecione um membro do servidor, ok? ||Que não seja você nem um bot, ok?||` })

        return message.reply({
            content: `${e.Loading} | ${member}, você esta sendo desafiado por ${message.author} para uma partida de Connect4.`,
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Aceitar',
                        emoji: e.amongusdance,
                        custom_id: JSON.stringify({ c: 'connect', src: 'init', userId: member.id, authorId: message.author.id }),
                        style: ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: 'Recusar',
                        emoji: '<a:a_hello:937498373727080480>',
                        custom_id: JSON.stringify({ c: 'connect', src: 'cancel', userId: member.id, authorId: message.author.id }),
                        style: ButtonStyle.Danger
                    },
                    {
                        type: 2,
                        label: 'Como Jogar',
                        emoji: '❔',
                        custom_id: JSON.stringify({ c: 'connect', src: 'info' }),
                        style: ButtonStyle.Primary
                    }
                ]
            }]
        })
    }
}