import { ButtonInteraction, ButtonStyle } from "discord.js"
import { Database, SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

/**
 * @param { ButtonInteraction } interaction
 */
export default async (interaction) => {

    const { message, customId, user, guild } = interaction
    const gameData = await Database.Cache.Jokempo.get(message.id)

    if (!gameData)
        return interaction.update({
            content: `${e.Deny} | Jogo não encontrado no cache.`,
            components: []
        }).catch(() => { })

    const customIdData = JSON.parse(customId)
    const { value, userId } = customIdData

    if (user.id !== userId)
        return await interaction.reply({
            content: `${e.cry} | Infelizmente, você não é o usuário desafiado neste jokempo.`,
            ephemeral: true
        })

    const MoedaCustom = await guild.getCoin()

    if (value > 0) {
        const userBalance = await Database.User.findOne({ id: userId }, 'Balance')
        const balance = userBalance?.Balance || 0
        if (balance < value) return disable(balance)
    }

    await Database.User.updateOne(
        { id: userId },
        {
            $inc: { Balance: -value },
            $push: {
                Transactions: {
                    $each: [{
                        time: `${Date.format(0, true)}`,
                        data: `${e.loss} Apostou ${value} Safiras no Jokempo`
                    }],
                    $position: 0
                }
            }
        }
    )

    Database.Cache.Jokempo.push(`${message.id}.players`, userId)

    return interaction.update({
        content: null,
        embeds: [{
            color: client.blue,
            title: '✌️ Jokempo',
            description: `${e.Loading} <@${message.interaction.user.id}> ainda não escolheu\n${e.Loading} ${user} ainda não escolheu`,
            fields: [{
                name: `${e.Tax} Valor Apostado`,
                value: `**${value.currency()} ${MoedaCustom}**`
            }]
        }],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: e.pedra,
                        custom_id: JSON.stringify({ c: 'jkp', type: 'user', play: 'stone' }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: e.tesoura,
                        custom_id: JSON.stringify({ c: 'jkp', type: 'user', play: 'scissors' }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: e.papel,
                        custom_id: JSON.stringify({ c: 'jkp', type: 'user', play: 'paper' }),
                        style: ButtonStyle.Primary
                    }
                ]
            }
        ]
    })

    async function disable(balance) {
        client.emit('jokempoRefund', { id: message.id, value: gameData })
        return interaction.update({
            content: `${e.Deny} | ${user}, você não tem dinheiro suficiente para iniciar essa aposta no jokempo.\n${e.Info} | Você precisa de mais **${(value - balance).currency()} ${MoedaCustom}**.`,
            components: []
        })
    }

}