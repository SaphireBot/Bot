import { ButtonStyle } from "discord.js"
import { Database } from "../../../../../classes/index.js"
import startDice from "../../../../classes/buttons/bet/dice/start.dice.js"

export default async ({ interaction, e, client, Moeda: moeda }) => {

    const { user } = interaction

    const userData = await Database.User.findOne({ id: user.id }, 'Balance')
    user.balance = userData?.Balance || 0
    const value = interaction.options.getInteger('value')

    if (user.balance < value)
        return await interaction.reply({
            content: `${e.Deny} | Você não possui todo esse dinheiro.`,
            ephemeral: true
        })

    const msg = await interaction.reply({
        embeds: [{
            color: client.blue,
            title: `🎲 ${client.user.username}'s Dice Game`,
            fields: [
                {
                    name: '🔵 Azul (0)',
                    value: `${e.dice} \`0\` + \`0\``,
                    inline: true
                },
                {
                    name: '🔴 Vermelho (0)',
                    value: `${e.dice} \`0\` + \`0\``,
                    inline: true
                },
                {
                    name: `${e.Info} Status`,
                    value: `${e.Loading} Esperando os usuários apostarem em seus lados\n💸 Valor de Entrada: **${value} ${moeda}**\n💰 Prêmio Acumulado: **${value} ${moeda}**\n⏱️ ${Date.GetTimeout(20000, Date.now(), 'R')}`
                }
            ],
            footer: {
                text: "O jogo 'travou'? Delete a mensagem que eu devolvo o dinheiro."
            }
        }],
        components: [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: "Azul",
                    custom_id: JSON.stringify({ c: 'bet', src: 'dice', color: 'blue' }),
                    style: ButtonStyle.Primary
                },
                {
                    type: 2,
                    label: "Vermelho",
                    custom_id: JSON.stringify({ c: 'bet', src: 'dice', color: 'red' }),
                    style: ButtonStyle.Danger
                },
            ]
        }],
        fetchReply: true
    })

    await Database.Cache.Bet.set(msg.id, {
        authorId: user.id,
        value,
        date: Date.now(),
        blue: [],
        red: [],
        messageId: msg.id
    })

    setTimeout(() => startDice(msg, moeda), 20000)

    return
}