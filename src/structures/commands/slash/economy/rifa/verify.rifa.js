import { ButtonStyle } from "discord.js"
import {
    SaphireClient as client,
    Database
} from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"

export default async interaction => {

    const { guild } = interaction
    const document = await Database.Economy.findOne({ id: client.user.id }, 'Rifa')
    const rifaData = document?.Rifa

    if (!rifaData)
        return await interaction.reply({
            content: `${e.Deny} | Nenhum dado da rifa foi encontrado no banco de dado.`,
            ephemeral: true
        })

    const numbers = rifaData.Numbers || []
    const TempPrize = rifaData.TempPrize || 0
    const LastNumber = rifaData.LastNumber || 0
    const moeda = await guild.getCoin()
    const LastPrize = `${TempPrize > 0 ? '^' : ''}${(rifaData.LastPrize || 0)?.currency()} ${moeda}`

    const LastWinner = TempPrize > 0
        ? 'Último vencedor não encontrado. Prêmio acumulado'
        : `${client.users.resolve(rifaData.LastWinner)?.username || 'Ninguém ganhou por enquanto'} - \`${rifaData.LastWinner || 0}\``

    const numbersArray = [...Array(91).keys()].slice(1)
    const availableNumbers = numbersArray
        .map(num => numbers.find(data => data.number === num) ? null : `${num < 10 ? `0${num}` : num}`)
        .filter(i => i)

    let control = 0
    let availableNumbersString = ''

    for (let num of availableNumbers) {

        control++
        availableNumbersString += `${num} `

        if (control >= 10) {
            control = 0
            availableNumbersString += '\n'
        } else
            if (num !== '90')
                availableNumbersString += '- '

        continue
    }

    const replyData = {
        embeds: [{
            color: client.blue,
            title: `🛰 ${client.user.username}'s Rifa - Verificação`,
            description: 'Aqui é onde fica os dados da rifa atual e do último prêmio',
            fields: [
                {
                    name: '🏷️ Rifa Atual',
                    value: `${numbers.length} foram compradas somando ${((numbers.length * 1000) + TempPrize).currency()} ${moeda}`
                },
                {
                    name: `🧩 Última Rifa`,
                    value: `Número sorteado: \`${LastNumber || 0}\`\nPrêmio: ${LastPrize || 0}\nPrêmio acumulado: ${(TempPrize || 0).currency()} ${moeda}\nVencedor: ${LastWinner}`
                },
                {
                    name: '🔢 Números Disponíveis',
                    value: `\`\`\`txt\n${availableNumbersString}\n\`\`\``
                }
            ]
        }],
        components: [{
            type: 1,
            components: [{
                type: 2,
                label: 'Atualizar',
                emoji: '🔄',
                custom_id: JSON.stringify({ c: 'rifa', src: 'refresh' }),
                style: ButtonStyle.Primary
            }]
        }]
    }

    return interaction.message
        ? await interaction.update(replyData).catch(() => { })
        : await interaction.reply(replyData)

}