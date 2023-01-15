import { Database } from "../../../../../classes/index.js"
import startDice from "./start.dice.js"

export default async ({ interaction, message, e, user, guild }, commandData) => {

    const messageId = message.id
    let gameData = await Database.Cache.Bet.get(messageId)

    if (!gameData)
        return await interaction.update({
            content: `${e.Deny} | Jogo não encontrado.`,
            embeds: [],
            components: []
        }).catch(() => { })

    const guildData = await Database.Guild.findOne({ id: guild.id }, 'Moeda')
    const moeda = guildData?.Moeda || `${e.Coin} Safiras`

    if ((gameData.date + 20000) < Date.now())
        return startDice(message, moeda)

    let usersInGame = [...gameData.blue, ...gameData.red]

    if (!message?.embeds[0]?.data) {
        message.delete()?.catch(() => { })
        return await interaction.reply({ content: `${e.Deny} | Embed da aposta \`${message.id}\` não foi encontrada.` })
    }

    if (usersInGame.includes(user.id))
        return await interaction.reply({
            content: `${e.Deny} | Você já está participando desta aposta.`,
            ephemeral: true
        })

    const userData = await Database.User.findOne({ id: user.id }, 'Balance')
    const userMoney = userData?.Balance || 0
    const value = gameData.value

    if (userMoney < value)
        return await interaction.reply({
            content: `${e.Deny} | Você não tem dinheiro suficiente para entrar nesta aposta.`,
            ephemeral: true
        })

    const side = commandData.color

    const embed = message?.embeds[0]?.data

    if (!embed) {
        message?.delete()?.catch(() => { })
        return await interaction.reply({ content: `${e.Deny} | A embed da aposta \`${message.id}\` não foi encontrada.` })
    }

    await Database.User.updateOne(
        { id: user.id },
        { $inc: { Balance: -value } }
    )

    gameData = await Database.Cache.Bet.push(`${messageId}.${side}`, user.id)
    usersInGame = [...gameData.blue, ...gameData.red]

    embed.fields[0].name = `🔵 Azul (${gameData.blue.length})`
    embed.fields[1].name = `🔴 Vermelho (${gameData.red.length})`
    embed.fields[2].value = `${e.Loading} Esperando os usuários apostarem em seus lados\n💸 Valor de Entrada: **${value} ${moeda}**\n💰 Prêmio Acumulado: **${value * usersInGame.length} ${moeda}**\n⏱️ ${Date.GetTimeout(20000, gameData.date, 'R')}`

    await interaction.update({ embeds: [embed] }).catch(() => { })
    return await interaction.followUp({
        content: `${e.Check} | Você apostou no lado ${side === 'blue' ? 'Azul' : 'Vermelho'}`,
        ephemeral: true
    })
}
