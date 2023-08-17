import { SaphireClient as client, Database } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import buildRaspadinha from "./build.raspadinha.js"

export default async interaction => {

    const { user, guild } = interaction
    const userData = await Database.getUser(user.id)
    const userBalance = userData?.Balance || 0
    const moeda = await guild.getCoin()

    if (userBalance < 100)
        return interaction.update({
            content: `${e.Deny} | Você precisa ter pelo menos **100 ${moeda}** para abrir uma raspadinha.`,
            components: []
        }).catch(() => { })

    return Database.User.findOneAndUpdate(
        { id: user.id },
        { $inc: { Balance: -100 } },
        { upsert: true, new: true }
    )
        .then(async result => {
            Database.saveUserCache(result?.id, result)

            await Database.Client.updateOne(
                { id: client.user.id },
                {
                    $inc: {
                        ['Raspadinhas.Bought']: 1,
                        ['Raspadinhas.totalPrize']: 100
                    }
                }
            )

            return buildRaspadinha(interaction)
        })
        .catch(err => {
            return interaction.update({
                content: `${e.Deny} | Não foi possível iniciar a sua raspadinha. \`(${err.code || 0})\``,
                components: []
            }).catch(() => { })
        })
}