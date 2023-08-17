import { ButtonStyle, ChatInputCommandInteraction } from "discord.js"
import { Database, SaphireClient as client } from "../../../../../classes/index.js"
import { Emojis as e, Words } from "../../../../../util/util.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    const { user, guildId, options, channelId } = interaction
    const message = await interaction.reply({
        content: `${e.Loading} | Construindo novo jogo da forca...`,
        fetchReply: true
    })

    const amountLetters = options.getInteger('amount_letters')
    const words = Words.Mix.filter(word =>
        !word.replace(/\w+/g, "").length
        && word.length == amountLetters
    )
    const word = words[Math.floor(Math.random() * words.length)]

    if (!word)
        return interaction.editReply({
            content: `${e.Animated.SaphireCry} | Não foi possível obter nenhuma palavra.`
        })

    await Database.Cache.Hangman.set(
        message.id,
        {
            type: options.getString('style'),
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
                    name: `Palavra com ${amountLetters} letras`,
                    value: `\`${word.split("").fill('_').join(' ')}\``
                }
            ],
            footer: {
                text: `Estilo: ${options.getString('style')}`
            }
        }],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Tentar Letra',
                        emoji: e.Animated.SaphireQuestion,
                        custom_id: JSON.stringify({
                            c: 'hangman',
                            type: 'letter',
                            word
                        }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Tentar Palavra',
                        emoji: e.Animated.SaphireReading,
                        custom_id: JSON.stringify({
                            c: 'hangman',
                            type: 'word',
                            word
                        }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Desistir',
                        custom_id: JSON.stringify({
                            c: 'hangman',
                            type: 'giveup'
                        }),
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ]
    }).catch(() => { })
}