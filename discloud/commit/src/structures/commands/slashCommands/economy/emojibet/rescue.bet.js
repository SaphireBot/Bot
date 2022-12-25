import { Database } from '../../../../../classes/index.js'
import { Emojis as e } from '../../../../../util/util.js'

export default async interaction => {

    const { user, guild } = interaction

    const cachedValue = await Database.Cache.EmojiBetRescue.get(user.id)

    if (!cachedValue)
        return await interaction.reply({
            content: `${e.Deny} | Você não tem nenhum valor a ser resgatado.`,
            ephemeral: true
        })

    if (cachedValue < 0) {
        await Database.Cache.EmojiBetRescue.delete(user.id)
        return await interaction.reply({
            content: `${e.Deny} | Você não tem nenhum valor a ser resgatado.`,
            ephemeral: true
        })
    }

    await Database.User.updateOne(
        { id: user.id },
        {
            $inc: {
                Balance: cachedValue
            },
            $push: {
                Transactions: {
                    $each: [{
                        time: `${Date.format(0, true)}`,
                        data: `${e.Admin} Resgatou ${cachedValue} Safiras perdidas no Emoji Bet`
                    }],
                    $position: 0
                }
            }
        },
        {
            upsert: true
        }
    )

    await Database.Cache.EmojiBetRescue.delete(user.id)
    const coin = await guild.getCoin()

    return await interaction.reply({
        content: `${e.Check} | Você resgatou **${cachedValue.currency()} ${coin}** perdidas no emoji bet.`
    })
}