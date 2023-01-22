import {
    SaphireClient as client,
    Database
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import buildRaspadinha from "./build.raspadinha.js"

export default async interaction => {

    const { user, guild } = interaction
    const userData = await Database.User.findOne({ id: user.id }, 'Balance')
    const userBalance = userData?.Balance || 0
    const moeda = await guild.getCoin()

    if (userBalance < 100)
        return await interaction.update({
            content: `${e.Deny} | Você precisa ter pelo menos **100 ${moeda}** para abrir uma raspadinha.`,
            components: []
        }).catch(() => { })

    return Database.User.updateOne(
        { id: user.id },
        {
            $inc: {
                Balance: -100
            }
        },
        { upsert: true }
    )
        .then(async result => {

            if (result.modifiedCount !== 1)
                return await interaction.update({
                    content: `${e.Deny} | Por algum motivo, não foi possível iniciar a sua raspadinha.`,
                    components: []
                }).catch(() => { })

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
        .catch(async err => {
            console.log(err)
            return await interaction.update({
                content: `${e.Deny} | Não foi possível iniciar a sua raspadinha. \`(${err.code || 0})\``,
                components: []
            })
        })
}