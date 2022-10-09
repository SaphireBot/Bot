import { ButtonStyle } from "discord.js"

export default async ({
    interaction,
    value,
    e,
    message,
    client,
    Database
}) => {

    const { user, guild } = interaction
    const messageAuthorId = message.interaction.user.id
    if (user.id !== messageAuthorId) return

    const number = parseInt(value)
    const document = await Database.Economy.findOne({ id: client.user.id }, 'Rifa')
    const rifaData = document?.Rifa

    if (!rifaData)
        return await interaction.update({
            content: `${e.Deny} | Não há nenhum dado registrado sobre a Rifa no banco de dados.`,
            embeds: [],
            components: []
        }).catch(() => { })

    const rifaNumber = rifaData?.Numbers.find(num => num.number === number) || {}
    const numberInArray = rifaData?.Numbers.filter(nums => nums?.number === number) || []

    if (!rifaNumber)
        return await interaction.update({
            content: `${e.Deny} | O número requisitado não foi encontrado na lista de números comprados.`,
            embeds: [],
            components: []
        }).catch(() => { })

    const { embeds } = message
    const embed = embeds[0]?.data || null

    return removePrize()
        .catch(async err => {
            console.log(err)
            return await interaction.update({
                content: `${e.Deny} | Reembolso de número único mal sucedido.`,
                embeds: [],
                components: []
            }).catch(() => { })
        })

    async function success(rifaData) {

        const userNumbers = rifaData.Rifa?.Numbers
            .filter(nums => nums?.userId === user.id)
            .map(num => ({ number: num.number, userId: num.userId }))
            .map(i => JSON.stringify(i))
            .reduce((acc, cur) => (acc.includes(cur) || acc.push(cur), acc), [])
            .map(i => JSON.parse(i))

        const components = [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Solicitar Reembolso Completo',
                    custom_id: JSON.stringify({
                        c: 'rifaRefund',
                        src: 'accept'
                    }),
                    style: ButtonStyle.Success
                },
                {
                    type: 2,
                    label: 'Cancelar Solicitação',
                    custom_id: JSON.stringify({
                        c: 'rifaRefund',
                        src: 'deny'
                    }),
                    style: ButtonStyle.Danger
                }
            ]
        }]

        if (embed) {
            const moeda = await guild.getCoin()

            embed.color = client.blue
            embed.fields = (userNumbers?.length - 1) > 0
                ? embed.fields = [
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
                    },
                    {
                        name: `${e.Check} Status`,
                        value: `O reembolso para o número **${number}** foi solicitado e tudo ocorreu como esperado.\nSeu dinheiro já está na sua conta.`
                    }
                ]
                : embed.fields = [
                    {
                        name: `${e.Info} Nada por aqui`,
                        value: 'Você não possui nenhum número de rifa a ser reembolsado.'
                    },
                    {
                        name: `${e.Check} Status`,
                        value: `O reembolso para o número **${number}** foi solicitado e tudo ocorreu como esperado.\nSeu dinheiro já está na sua conta.`
                    }
                ]

            const selectMenuObject = {
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'rifaRefund',
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

            components.unshift(selectMenuObject)
        }

        return await interaction.update({
            content: embed ? null : `${e.Check} | Reembolso realizado com sucesso.`,
            embeds: embed ? [embed] : [],
            components: userNumbers.length > 0 ? components : []
        })

    }

    async function removePrize() {

        Database.Economy.findOneAndUpdate(
            { id: client.user.id },
            {
                $pull: {
                    ['Rifa.Numbers']: {
                        number: {
                            $in: [number]
                        }
                    }
                },
                $inc: {
                    'Rifa.Prize': (numberInArray.length * 1000)
                }
            },
            {
                upsert: true,
                new: true,
                fields: ['Rifa']
            },
            async (error, document) => {

                if (error)
                    return await interaction.update({
                        content: `${e.Deny} | Erro na execução ao remover o número da rifa - Database Reporter`,
                        embeds: [],
                        components: []
                    }).catch(() => { })

                subtractMoneyFromUser()
                return success(document)
            }
        )

        async function subtractMoneyFromUser() {
            await Database.User.updateOne(
                { id: user.id },
                {
                    $inc: {
                        Balance: 1000
                    },
                    $push: {
                        Transactions: {
                            $each: [{
                                time: `${Date.format(0, true)}`,
                                data: `${e.Admin} Resgatou 1000 Safiras via *Raffle Refund System (N° ${number})*`
                            }],
                            $position: 0
                        }
                    }
                },
                { upsert: true }
            )
            return
        }

        return
    }
}