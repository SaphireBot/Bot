import { Database, SaphireClient as client } from "../../../../classes/index.js";
import { ModalSubmitInteraction } from "discord.js";
import { Emojis as e } from "../../../../util/util.js";

/**
 * @param { ModalSubmitInteraction } interaction
 * @param {{
 *     type: 'multiplayer' | 'solo' | 'custom'
 *     word: String,
 *     creatorId: String,
 *     guildId: String,
 *     channelId: String,
 *     attempts: Number,
 *     alreadySended: Array
 *   }} gameData
 */
export default async (interaction, gameData) => {

    const { fields, message } = interaction
    const word = fields.getTextInputValue('word')?.toLowerCase()

    if (!/^[a-zA-Z]+$/.test(word))
        return interaction.followUp({
            content: `${e.Deny} | Acentos e caracteres especiais não são permitidos, ok?`,
            ephemeral: true
        })

    if (gameData.word == word)
        return finish()
    else {
        await Database.Cache.Hangman.sub(`${message.id}.attempts`, 1)
        gameData.attempts--
        if (gameData.attempts < 1) return lose()
    }
    return refresh()

    async function refresh() {

        let wordString = ""

        for (let l of gameData.word.split(""))
            wordString += gameData.alreadySended.includes(l)
                ? `${l} `
                : "_ "

        if (!wordString.includes('_')) return finish()

        interaction.followUp({
            content: `${e.Animated.SaphireCry} | Você errou a palavra...`,
            ephemeral: true
        })

        return interaction.editReply({
            embeds: [{
                color: client.blue,
                title: '📝 Jogo da Forca',
                description: new Array(6).fill("🖤").fill('❤️', 0, gameData.attempts).join(''),
                fields: [
                    {
                        name: `Palavra com ${gameData.word.length} letras`,
                        value: `\`${wordString.trim()}\``
                    },
                    {
                        name: '📝 Letras Usadas',
                        value: gameData.alreadySended.map(l => `\`${l}\``).join(', ') || 'Nenhuma letra usada por enquanto'
                    }
                ],
                footer: { text: `Estilo: ${gameData.type}` }
            }]
        }).catch(() => { })
    }

    async function lose() {
        await Database.Cache.Hangman.delete(message.id)
        await interaction.followUp({
            content: `${e.Animated.SaphireCry} | Você escolheu o caminho mais difícil e falhou. Você acabou com o jogo na última tentiva.`,
            ephemeral: true
        })

        let wordString = ""

        for (let l of gameData.word.split(""))
            wordString += gameData.alreadySended.includes(l)
                ? `${l} `
                : "_ "

        return interaction.editReply({
            embeds: [{
                color: client.red,
                title: '📝 Jogo da Forca',
                description: '🖤🖤🖤🖤🖤🖤',
                fields: [
                    {
                        name: `Palavra com ${gameData.word.length} letras`,
                        value: `\`${wordString.trim()}\`` + `\n\`${gameData.word.split("").join(" ")}\``
                    },
                    {
                        name: '📝 Letras Usadas',
                        value: gameData.alreadySended.map(l => `\`${l}\``).join(', ') || 'Nenhuma letra usada por enquanto'
                    }
                ],
                footer: { text: `Estilo: ${gameData.type}` }
            }],
            components: []
        }).catch(() => { })
    }

    async function finish() {

        await Database.Cache.Hangman.delete(message.id)
        await interaction.followUp({
            content: `${e.Animated.SaphireDance} | Parabééééns! Você acertou a palavra do jogo!`,
            ephemeral: true
        })

        return interaction.editReply({
            embeds: [{
                color: client.green,
                title: '📝 Jogo da Forca',
                description: new Array(6).fill("🖤").fill('❤️', 0, gameData.attempts).join(''),
                fields: [
                    {
                        name: `Palavra com ${gameData.word.length} letras`,
                        value: `\`${gameData.word.split("").join(" ")}\``
                    },
                    {
                        name: '📝 Letras Usadas',
                        value: gameData.alreadySended.map(l => `\`${l}\``).join(', ') || 'Nenhuma letra usada por enquanto'
                    },
                    {
                        name: '👑 Inteligência!',
                        value: `${interaction.user} acertou a palavra.`
                    }
                ],
                footer: { text: `Estilo: ${gameData.type}` }
            }],
            components: []
        }).catch(() => { })
    }
}