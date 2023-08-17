import { SaphireClient as client, Database } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import { socket } from "../../../../websocket/websocket.js"
import verifyRifa from "../../../commands/slashCommands/economy/rifa/verify.rifa.js"

export default async (interaction, { src: customId }) => {

    const { user, message } = interaction
    const messageAuthorId = message.interaction.user.id
    if (user.id !== messageAuthorId) return

    if (customId === 'refresh')
        return verifyRifa(interaction)

    if (customId === 'deny')
        return await message?.delete().catch(() => { })

    const document = await Database.Economy.findOne({ id: client.user.id }, 'Rifa')
    const rifaData = document?.Rifa

    if (!rifaData)
        return await interaction.update({
            content: `${e.Deny} | Não há nenhum dado registrado sobre a Rifa no banco de dados.`,
            embeds: [],
            components: []
        }).catch(() => { })

    const userNumbers = rifaData?.Numbers.filter(nums => nums?.userId === user.id) || []

    if (!userNumbers || !userNumbers.length)
        return await interaction.update({
            content: `${e.Deny} | Você não tem nenhum número da rifa disponível para reembolso.`,
            embeds: [],
            components: []
        }).catch(() => { })

    const quantity = parseInt(userNumbers.length * 1000)
    const { embeds } = message
    const embed = embeds[0]?.data || null

    await removePrize()
        .then(() => success())
        .catch(async err => {
            console.log(err)
            return await interaction.update({
                content: `${e.Deny} | Reembolso mal sucedido.`,
                embeds: [],
                components: []
            }).catch(() => { })
        })

    async function success() {

        if (embed) {
            embed.color = client.green
            embed.fields.push({
                name: `${e.Check} Status`,
                value: 'O reembolso foi solicitado e tudo ocorreu como esperado.\nSeu dinheiro já está na sua conta.'
            })
        }

        return await interaction.update({
            content: embed ? null : `${e.Check} | Reembolso realizado com sucesso.`,
            embeds: embed ? [embed] : [],
            components: []
        })

    }

    async function removePrize() {

        await Database.Economy.updateOne(
            { id: client.user.id },
            {
                $pull: {
                    'Rifa.Numbers': {
                        userId: {
                            $in: [user.id]
                        }
                    }
                },
                $inc: {
                    'Rifa.Prize': -quantity
                }
            },
            { upsert: true }
        )

        const transaction = {
            time: `${Date.format(0, true)}`,
            data: `${e.Admin} Resgatou ${quantity} Safiras via *Raffle Refund System*`
        }

        socket?.send({
            type: "transactions",
            transactionsData: { value: quantity, userId: user.id, transaction }
        })

        await Database.User.findOneAndUpdate(
            { id: user.id },
            {
                $inc: { Balance: quantity },
                $push: {
                    Transactions: {
                        $each: [transaction],
                        $position: 0
                    }
                }
            },
            { upsert: true, new: true }
        )
            .then(doc => Database.saveUserCache(doc?.id, doc))

        return
    }
}