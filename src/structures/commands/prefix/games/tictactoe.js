import { Message } from 'discord.js'
import { Emojis as e } from '../../../../util/util.js'
import TicTacToe from '../../functions/tictactoe/newGame.tictactoe.js'

export default {
    name: 'tictactoe',
    description: '[games] O famoso jogo da velha',
    aliases: ['jogodavelha', 'jgv', 'ttt'],
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
        ) return message.reply({ content: `${e.Deny} | Hey, selecione alguém para jogar contra você. Menos você mesmo e bots, eles ganhariam de você facilmente.` })

        return TicTacToe(undefined, member, message)
    }
}