import {
    SaphireClient as client,
    Database
} from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"
import makeTheSuperGiveaway from "./giveaway.rifa.js"

export default async interaction => {

    const { options, user, guild } = interaction
    const number = options.getInteger('comprar')

    if (number < 1 || number > 90)
        return await interaction.reply({
            content: `${e.Deny} | Número de rifa inválido.`,
            ephemeral: true
        })

    const userBalance = await user.balance() || 0
    const moeda = await guild.getCoin()

    if (!userBalance || userBalance < 1000)
        return await interaction.reply({
            content: `${e.Deny} | Você precisa possuir no mínimo 1000 ${moeda}.`,
            ephemeral: true
        })

    const rifaData = await Database.Economy.findOne({ id: client.user.id }, 'Rifa') || []
    const numbers = rifaData?.Rifa?.Numbers || []

    if (numbers?.filter(nums => nums?.userId === user.id)?.length >= 5)
        return await interaction.reply({
            content: `${e.Deny} | Você já atingiu o limite de 5 rifas compradas.`,
            ephemeral: true
        })

    return Database.Economy.findOneAndUpdate(
        { id: client.user.id },
        {
            $addToSet: {
                'Rifa.Numbers': {
                    number: number,
                    userId: user.id
                }
            }
        },
        {
            upsert: true,
            new: true,
            fields: ['Rifa']
        }
    )
        .then(async updateResult => {

            if (updateResult.Rifa.Numbers.length === numbers.length)
                return await interaction.reply({
                    content: `${e.Deny} | Alguém já comprou este número. Por favor, tente um outro número.`,
                    ephemeral: true
                })

            await interaction.reply({
                content: `${e.Check} | Você comprou o número **${number}** da ${client.user.username}'s Rifa. Agora é só esperar o resultado. Boa sorte!`
            })

            if (updateResult.Rifa.Numbers.length >= 90)
                makeTheSuperGiveaway(updateResult)

            return addPrize()
        })
        .catch(async () => {
            return await interaction.reply({
                content: `${e.Deny} | Não foi possível comprar este número da ${client.user.username}'s Rifa.`,
                ephemeral: true
            }).catch(() => { })
        })

    async function addPrize() {

        await Database.User.updateOne(
            { id: user.id },
            {
                $inc: {
                    Balance: -1000
                },
                $push: {
                    Transactions: {
                        $each: [{
                            time: `${Date.format(0, true)}`,
                            data: `${e.loss} Gastou 1000 Safiras comprando o número ${number} na Rifa`
                        }],
                        $position: 0
                    }
                }
            },
            { upsert: true }
        )

        return
    }

}