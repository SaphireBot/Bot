import { Emojis as e } from "../../../../../../util/util.js"
import { SaphireClient as client, Database } from "../../../../../../classes/index.js"
import realizeBet from "./realize.bet.js"

export default async (message) => {

    const thisBet = await Database.Cache.Bet.get(`Bet.${message.id}`) || {}
    if (!thisBet) return

    if (thisBet?.players?.length > 1) return realizeBet(thisBet, message)

    const embed = message.embeds[0]?.data

    if (!embed)
        return await message.edit({
            content: `${e.Deny} | Finalização corrompida.`
        }).catch(() => { })

    embed.color = client.red
    embed.footer = { text: 'Aposta encerrada' }
    embed.fields[2].value = 'Tempo esgotado'

    message.reactions.removeAll().catch(() => { })

    client.emit('betRefund', thisBet)

    return await message.edit({ embeds: [embed] }).catch(() => { })
}