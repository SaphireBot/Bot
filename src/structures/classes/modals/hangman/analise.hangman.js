import { ModalSubmitInteraction } from "discord.js";
import { Emojis as e } from "../../../../util/util.js";
import { Database } from "../../../../classes/index.js";
import newHangman from "./new.hangman.js";
import letter from "./letter.hangman.js";
import word from "./word.hangman.js";

/**
 * @param { ModalSubmitInteraction } interaction
 */
export default async interaction => {

    const { message, customId } = interaction
    const data = JSON.parse(customId)
    if (data.src == 'new') return newHangman(interaction)

    await interaction.deferUpdate()
    /**
     * @type { {
     *    type: 'multiplayer' | 'solo' | 'custom'
     *    word: String,
     *    creatorId: String,
     *    guildId: String,
     *    channelId: String,
     *    attempts: Number,
     *    alreadySended: Array
     * } }
     */
    const gameData = await Database.Cache.Hangman.get(message.id)

    if (!gameData) {
        interaction.editReply({ components: [] })
        return interaction.followUp({
            content: `${e.Animated.SaphireCry} | Infelizmente o jogo que você respondeu não existe mais.`,
            ephemeral: true
        })
    }

    if (data.t == 'letter') return letter(interaction, gameData)
    if (data.t == 'word') return word(interaction, gameData)

    await Database.Cache.Hangman.delete(message.id)
    return interaction.editReply({
        content: `${e.Animated.SaphireCry} | Dados não encontado pelo Modal Interaction.`,
        embeds: [], components: []
    }).catch(() => { })
}