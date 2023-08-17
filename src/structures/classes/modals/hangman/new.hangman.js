import { ButtonStyle, ModalSubmitInteraction } from "discord.js"
import { SaphireClient as client, Database } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

/**
 * @param { ModalSubmitInteraction } interaction
 */
export default async interaction => {

    const { guildId, channelId, user, fields } = interaction
    const word = fields.getTextInputValue('word')

    if (word.replace(/\w+/g, "").length)
        return interaction.reply({
            content: `${e.Deny} | No no no. Apenas palavras de A-Z, beleza? Letras com acentos, números e caracteres especiais não podem ser utilizados aqui.`
        })

    const message = await interaction.reply({
        content: `${e.Loading} | Construindo novo jogo da forca...`,
        fetchReply: true
    })

    await Database.Cache.Hangman.set(
        message.id,
        {
            type: 'custom',
            word,
            creatorId: user.id,
            guildId,
            channelId,
            attempts: 6,
            alreadySended: []
        }
    )

    return interaction.editReply({
        content: null,
        embeds: [{
            color: client.blue,
            title: '📝 Jogo da Forca',
            description: '❤️❤️❤️❤️❤️❤️',
            fields: [
                {
                    name: `Palavra com ${word.length} letras`,
                    value: `\`${word.split("").fill('_').join(' ')}\``
                }
            ],
            footer: { text: 'Estilo: Custom' }
        }],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Tentar Letra',
                        emoji: e.Animated.SaphireQuestion,
                        custom_id: JSON.stringify({ c: 'hangman', type: 'letter', word }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Tentar Palavra',
                        emoji: e.Animated.SaphireReading,
                        custom_id: JSON.stringify({ c: 'hangman', type: 'word', word }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Desistir',
                        custom_id: JSON.stringify({ c: 'hangman', type: 'giveup' }),
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ]
    })

}