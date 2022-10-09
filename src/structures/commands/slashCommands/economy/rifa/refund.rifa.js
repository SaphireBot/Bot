import { ButtonStyle } from "discord.js"
import {
    SaphireClient as client,
    Database
} from "../../../../../classes/index.js"
import { Config } from "../../../../../util/Constants.js"
import { Emojis as e } from "../../../../../util/util.js"

export default async interaction => {

    const { user, guild } = interaction
    const document = await Database.Economy.findOne({ id: client.user.id }, 'Rifa')
    const rifaData = document?.Rifa

    if (!rifaData)
        return await interaction.reply({
            content: `${e.Deny} | Não há nenhum dado registrado sobre a Rifa no banco de dados.`,
            ephemeral: true
        })

    const userNumbers = rifaData?.Numbers
        ?.filter(nums => nums?.userId === user.id)
        ?.map(num => ({ number: num.number, userId: num.userId }))
        ?.map(i => JSON.stringify(i))
        ?.reduce((acc, cur) => (acc.includes(cur) || acc.push(cur), acc), [])
        ?.map(i => JSON.parse(i))

    if (!userNumbers || !userNumbers.length)
        return await interaction.reply({
            content: `${e.Deny} | Você não tem nenhum número da rifa comprado.`,
            ephemeral: true
        })

    const moeda = await guild.getCoin()

    const selectMenuObject = {
        type: 1,
        components: [{
            type: 3,
            custom_id: 'rifa',
            placeholder: 'Resgatar apenas um número',
            options: []
        }]
    }

    for (let num of userNumbers)
        selectMenuObject.components[0].options.push({
            label: `Número ${num.number}`,
            emoji: '🏷️',
            description: 'Valor de resgate: 1000 Safiras',
            value: `${num.number}`
        })

    return await interaction.reply({
        embeds: [{
            color: client.blue,
            title: `📩 ${client.user.username}'s Rifa Reembolso`,
            description: 'Você tem o direito de pegar seu dinheiro de volta gastos na Rifa.',
            thumbnail: {
                url: Config.RefundSystemIcon
            },
            fields: [
                {
                    name: '🏷️ Compras',
                    value: `Você tem exatamente **${userNumbers.length} números** comprados`
                },
                {
                    name: '♻️ Conversão',
                    value: `Ao solicitar o reembolso total, você irá ter um retorno de **${(userNumbers.length * 1000)?.currency()} ${moeda}**`
                },
                {
                    name: '🔢 Números',
                    value: `Você comprou os números ${userNumbers.map(num => `\`${num.number}\``).join(', ')}`
                }
            ],
            footer: {
                text: `${client.user.username}'s Refund System`
            }
        }],
        components: [
            selectMenuObject,
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Solicitar Reembolso Completo',
                        custom_id: JSON.stringify({
                            c: 'rifa',
                            src: 'accept'
                        }),
                        style: ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: 'Cancelar Solicitação',
                        custom_id: JSON.stringify({
                            c: 'rifa',
                            src: 'deny'
                        }),
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ]
    })

}