import { Emojis as e } from "../../../../util/util.js"
import {
    SaphireClient as client,
    Database
} from "../../../../classes/index.js"

export default async (interaction, { confirmated, value }) => {

    const { message, guild } = interaction
    const author = message.interaction.user

    const userId = confirmated.filter(id => id !== author.id)[0]
    const user = client.users.resolve(userId)

    Database.add(userId, value, `${e.gain} Recebeu um pagamento de ${value} Safiras de ${author.tag} \`${author.id}\``)

    await Database.User.findOneAndUpdate(
        { id: author.id },
        {
            Transactions: {
                $each:
                    [{
                        time: `${Date.format(0, true)}`,
                        data: `${e.loss} Pagou ${value} Safiras para ${user.tag} \`${user.id}\``
                    }],
                $position: 0
            }
        },
        { upsert: true, new: true }
    )
        .then(doc => Database.saveUserCache(doc?.id, doc))

    await Database.Cache.Pay.delete(`${author.id}.${message.id}`)
    return await interaction.update({
        content: `${e.Check} | Pagamento realizado com sucesso.\n${e.saphireRight} | <@${author.id}> enviou **${value.currency()} ${await guild.getCoin()}** para <@${user.id}>.`,
        components: []
    })
}