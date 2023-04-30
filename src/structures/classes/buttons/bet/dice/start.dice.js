import { Database } from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"

export default async (msg, moeda) => {

    if (!msg) return

    const message = await msg.channel.messages.fetch(msg.id).catch(() => null)

    if (!message) {
        msg.channel.send({ content: `${e.Deny} | Mensagem não encontrada.` })
        return msg.delete()?.catch(() => { })
    }

    const diceGame = await Database.Cache.Bet.get(message.id)
    if (!diceGame)
        return message.edit({ content: `${e.Deny} | Jogo não encontrado.`, embeds: [], components: [] })

    const usersInGame = [...new Set([...diceGame.red, ...diceGame.blue])]
    if (!usersInGame.length) {
        message.channel.send({ content: `${e.Deny} | A aposta \`${message.id}\` não teve nenhum participante.` }).catch(() => { })
        return message.delete()?.catch(() => { })
    }

    const embed = message?.embeds[0]?.data
    if (!embed) {
        message.channel.send({ content: `${e.Deny} | A Embed da aposta \`${message.id}\` não foi encontrada.` }).catch(() => { })
        return message.delete()?.catch(() => { })
    }

    const prize = diceGame.value * usersInGame.length
    embed.fields[2].value = `${e.Loading} Rolando dados\n💸 Valor de Entrada: **${diceGame.value} ${moeda}**\n💰 Prêmio Acumulado: **${prize} ${moeda}**\n⏱️ Tempo esgotado`
    message.edit({ embeds: [embed], components: [] }).catch(() => { })

    const result = { blue: 0, red: 0 }

    let i = 0

    const interval = setInterval(() => {
        const number = randomNumber()

        if (i === 0) {
            embed.fields[0].value = `${e.dice} \`${number}\` + \`0\``
            result.blue += number
        }

        if (i === 1) {
            embed.fields[1].value = `${e.dice} \`${number}\` + \`0\``
            result.red += number
        }

        if (i === 2) {
            embed.fields[0].value = `${e.dice} \`${result.blue}\` + \`${number}\``
            result.blue += number
        }

        if (i === 3) {
            embed.fields[1].value = `${e.dice} \`${result.red}\` + \`${number}\``
            result.red += number

            let teamWinner = result.red < result.blue ? 'blue' : 'red'
            return showResult(teamWinner)
        }

        i++
        return message.edit({ embeds: [embed] }).catch(() => { })

    }, 3000)

    async function showResult(teamWinner) {
        clearInterval(interval)

        if (result.red === result.blue) {
            await Database.Cache.Bet.delete(message.id)
            embed.fields[2].value = `${e.Deny} O jogo deu empate e os dois times perderam\n💸 Valor Pago: ${diceGame.value} ${moeda}\n💰 Prêmio Acumulado: ${prize}`
            return message.edit({ embeds: [embed] }).catch(() => { })
        }

        const betResult = diceGame.value * diceGame[teamWinner === 'blue' ? 'red' : 'blue'].length

        if (teamWinner === "blue") {
            embed.fields[0].name = `${embed.fields[0].name} ${e.waku}`
            embed.fields[1].name = `${embed.fields[1].name} ${e.Animated.SaphireCry}`

            if (!diceGame.blue.length)
                embed.fields[2].value = `${e.Check} O time Azul ganhou\n💸 Valor Pago: **${diceGame.value} ${moeda}**\n💰 Prêmio Acumulado: **${prize} ${moeda}**\n👤 Valor Recebido Por Pessoa: **0 ${moeda}** (Ninguém apostou no Azul)`
            else embed.fields[2].value = `${e.Check} O time Azul ganhou\n💸 Valor Pago: **${diceGame.value} ${moeda}**\n💰 Prêmio Acumulado: **${prize} ${moeda}**\n👤 Valor Recebido Por Pessoa: **${betResult} ${moeda}**`
        } else {
            embed.fields[1].name = `${embed.fields[1].name} ${e.waku}`
            embed.fields[0].name = `${embed.fields[0].name} ${e.Animated.SaphireCry}`

            if (!diceGame.red.length)
                embed.fields[2].value = `${e.Check} O time Vermelho ganhou\n💸 Valor Pago: **${diceGame.value} ${moeda}**\n💰 Prêmio Acumulado: **${prize} ${moeda}**\n👤 Valor Recebido Por Pessoa: **0 ${moeda}** (Ninguém apostou no Vermelho)`
            else embed.fields[2].value = `${e.Check} O time Vermelho ganhou\n💸 Valor Pago: **${diceGame.value} ${moeda}**\n💰 Prêmio Acumulado: **${prize} ${moeda}**\n👤 Valor Recebido Por Pessoa: **${betResult} ${moeda}**`
        }

        givePrize(betResult, diceGame[teamWinner], diceGame[teamWinner === 'blue' ? 'red' : 'blue'])

        return message.edit({ embeds: [embed] }).catch(() => { })
    }

    async function givePrize(betResult, winnersId, losersId) {
        await Database.Cache.Bet.delete(message.id)

        if (winnersId.length)
            await Database.User.updateMany(
                { id: { $in: winnersId } },
                {
                    $inc: { Balance: betResult + diceGame.value },
                    $push: {
                        Transactions: {
                            $each: [{
                                time: `${Date.format(0, true)}`,
                                data: `${e.gain} Ganhou ${betResult + diceGame.value || 0} Safiras jogando */bet dice*`
                            }],
                            $position: 0
                        }
                    }
                }
            )

        if (losersId.length)
            await Database.User.updateMany(
                { id: { $in: losersId } },
                {
                    $push: {
                        Transactions: {
                            $each: [{
                                time: `${Date.format(0, true)}`,
                                data: `${e.loss} Perdeu ${diceGame.value || 0} Safiras jogando */bet dice*`
                            }],
                            $position: 0
                        }
                    }
                }
            )
        return
    }

    function randomNumber() {
        return [1, 2, 3, 4, 5, 6][Math.floor(Math.random() * 6)]
    }
}