import { Database } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import validatePayment from './validate.pay.js'

export default async (interaction, customId) => {

    const { message, user } = interaction
    const rawComponents = message.components
    const userMention = message.mentions.users.first()
    const author = message.interaction.user
    const components = rawComponents[0].toJSON()
    const paymentData = await Database.Cache.Pay.get(`${author.id}.${message.id}`) || []

    if (!paymentData)
        return await interaction.update({
            content: `${e.Deny} | Dados do pagamento não encontrados.`,
            components: []
        }).catch(() => { })

    const { confirmated, value } = paymentData
    if (![author.id, userMention.id].includes(user.id)) return

    if (customId === 'deny') {
        Database.add(author.id, value)
        await Database.Cache.Pay.delete(`${author.id}.${message.id}`)
        return await interaction.update({
            content: `${e.Deny} | ${user} cancelou o pagamento.`,
            components: []
        }).catch(() => { })
    }

    if (confirmated.includes(user.id))
        return await interaction.deferUpdate().catch(() => { })

    const data = await Database.Cache.Pay.push(`${author.id}.${message.id}.confirmated`, user.id)
    components.components[0].label = `Confirmar ${confirmated.length + 1}/2`
    if ((confirmated.length + 1) >= 2) return validatePayment(interaction, data[message.id])
    return await interaction.update({ components: [components] }).catch(() => { })

}