import { ChatInputCommandInteraction, GuildMember, Message } from 'discord.js';
import { Emojis as e } from '../../../../util/util.js';
import buttonGenerator from './generateButton.tictactoe.js';

/**
 * @param { ChatInputCommandInteraction | undefined } interaction
 * @param { GuildMember } opponent
 * @param { Message | undefined } message
 */
export default async (interaction, opponent, message) => {

    const components = buttonGenerator(opponent.id, interaction?.user?.id || message?.author?.id)

    const playerRandom = [interaction?.user || message.author, opponent].random()
    const dataReply = { content: `${e.Loading} | ${playerRandom}, é sua vez.`, components }

    if (message) return message.reply(dataReply)
    if (interaction) return interaction.reply(dataReply)
    return
}