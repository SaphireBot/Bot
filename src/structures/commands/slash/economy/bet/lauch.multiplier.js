import { ButtonStyle, ChatInputCommandInteraction, parseEmoji } from "discord.js"
import { Database, SaphireClient as client } from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"
import { socket } from "../../../../../websocket/websocket.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    const { user, options, guild } = interaction
    const value = options.getInteger('value')

    const message = await interaction.reply({
        content: `${e.Loading} | Carrengando e construindo novo jogo.`,
        fetchReply: true
    })

    const betId = message.id
    const userData = await Database.getUser(user.id)
    const moeda = await guild.getCoin()

    if ((userData.Balance || 0) < value)
        return interaction.editReply({
            content: `${e.Deny} | Você não tem o valor apostado. Ainda te falta ${value - (userData.Balance || 0)} ${moeda}`
        })

    const transaction = {
        time: `${Date.format(0, true)}`,
        data: `${e.loss} Apostou ${value.currency()} Safiras no *Bet Multiplier*`
    }

    socket?.send({
        type: "transactions",
        transactionsData: { value, userId: user.id, transaction }
    })

    await Database.User.findOneAndUpdate(
        { id: user.id },
        {
            $inc: { Balance: -value },
            $push: {
                Transactions: {
                    $each: [transaction],
                    $position: 0
                }
            }
        },
        { upsert: true, new: true }
    )
        .then(data => Database.saveUserCache(data?.id, data))

    await Database.Cache.Multiplier.set(
        `${user.id}.${betId}`,
        {
            value,
            mines: 0,
            prize: value,
            multiplierValue: 0,
            userId: user.id
        }
    )

    return interaction.editReply({
        content: `${e.Animated.SaphireDance} | Escolha um multiplicador pra gente começar a jogar`,
        embeds: [{
            color: client.blue,
            title: `💣 ${client.user.username}'s Multiplicador`,
            description: 'Aumente o multiplicador a cada diamante encontrado.\nSe clicar na bomba, perde tudo.',
            fields: [
                {
                    name: '💸 Valor Apostado',
                    value: `${value} ${moeda}`
                }
            ],
            footer: {
                text: `Bet ID: ${betId}`
            }
        }],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 3,
                        custom_id: JSON.stringify({ c: 'bet', src: 'multi', type: 'multi', id: betId }),
                        placeholder: 'Escolher quantidade de minas',
                        options: [
                            ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
                                .map(i => ({
                                    label: `${i} Minas`,
                                    emoji: '💣',
                                    description: `Multiplique por x${(i * 0.041666666).toFixed(3)}`,
                                    value: `${i}`
                                }))
                        ]
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Cancelar Aposta',
                        emoji: parseEmoji(e.Animated.SaphireCry),
                        custom_id: JSON.stringify({ c: 'bet', src: 'multi', type: 'cancel', id: betId }),
                        style: ButtonStyle.Danger
                    },
                    {
                        type: 2,
                        label: 'Iniciar Aposta',
                        emoji: parseEmoji(e.Animated.SaphireDance),
                        custom_id: JSON.stringify({ c: 'bet', src: 'multi', type: 'init', id: betId }),
                        style: ButtonStyle.Success,
                        disabled: true
                    }
                ]
            }
        ]
    })
}