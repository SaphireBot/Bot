import { ButtonInteraction } from "discord.js";
import { Database, Modals } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";

/**
 * @param { ButtonInteraction } interaction
 * @param { { c: 'hangman', type: 'letter' | 'word' | 'giveup', word: string | undefined } } commandData
 */
export default async (interaction, commandData) => {

    const { message, user } = interaction

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

    if (!gameData)
        return interaction.update({ content: `${e.Deny} | Jogo não encontrado.`, components: [], embeds: [] }).catch(() => { })

    if (commandData?.type == 'giveup') return giveup()

    if (gameData.type == 'custom' & gameData.creatorId == user.id)
        return interaction.reply({
            content: `${e.Deny} | Você não pode jogar aqui, sabia? Foi você que enviou a palavra.`,
            ephemeral: true
        })

    if (gameData.type == 'solo' & gameData.creatorId !== user.id)
        return interaction.reply({
            content: `${e.Deny} | Hey! Esse jogo é solo. Apenas <@${gameData.creatorId}> pode jogar aqui.`,
            ephemeral: true
        })

    const placeholder = message.embeds[0]?.data?.fields[0]?.value?.replace(/`/g, '')

    if (!placeholder) {
        await Database.Cache.Hangman.delete(message.id)
        return interaction.update({ content: `${e.Deny} | Embed não encontrada.`, components: [], embeds: [] }).catch(() => { })
    }

    commandData?.type == 'word'
        ? interaction.showModal(Modals.hangmanNewWord(gameData.word, placeholder))
        : interaction.showModal(Modals.hangmanNewLetter(gameData.word, placeholder))

    async function giveup() {

        if (gameData.creatorId !== user.id)
            return interaction.reply({
                content: `${e.Deny} | Apenas o criador do jogo pode desistir, ok?`,
                ephemeral: true
            })

        await Database.Cache.Hangman.delete(message.id)
        return interaction.update({
            content: `🏳️ | O jogo foi deletado e a palavra era **${gameData.word}**.`,
            embeds: [], components: []
        }).catch(() => { })
    }

}