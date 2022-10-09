import {
    SaphireClient as client,
    Database
} from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"

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

    const rifaData = await Database.Economy.find({}, 'Rifa') || []
    const numbers = rifaData[0]?.Rifa?.Numbers || []

    if (numbers?.filter(nums => nums?.userId === user.id)?.length >= 5)
        return await interaction.reply({
            content: `${e.Deny} | Você já atingiu o limite de 5 rifas compradas.`,
            ephemeral: true
        })

    return Database.Economy.updateOne(
        {},
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
            new: true
        }
    )
        .then(async updateResult => {

            if (updateResult.modifiedCount === 0)
                return await interaction.reply({
                    content: `${e.Deny} | Alguém já comprou este número. Por favor, tente um outro número.`,
                    ephemeral: true
                })

            await interaction.reply({
                content: `${e.Check} | Você comprou o número **${number}** da ${client.user.username}'s Rifa. Agora é só esperar o resultado. Boa sorte!`
            })

            return addPrize()
        })
        .catch(async () => {
            return await interaction.reply({
                content: `${e.Deny} | Não foi possível comprar este número da ${client.user.username}'s Rifa.`,
                ephemeral: true
            }).catch(() => { })
        })

    async function addPrize() {

        await Database.Economy.updateOne(
            {},
            {
                $inc: {
                    'Rifa.Prize': 1000
                }
            },
            { upsert: true }
        )

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