import { Emojis as e } from '../../util/util.js'
import {
    SaphireClient as client,
    Database
} from '../../classes/index.js'

export default async newPayment => {

    const { status, status_detail, metadata, transaction_amount } = newPayment

    const channel = await client.channels.fetch(metadata.channel_id)
    if (!channel) return

    const user = await channel.guild.members.fetch(metadata.user_id)
    if (!user) return

    const message = await channel.messages.fetch(metadata.message_id)
    if (!message) return

    if (status === 'pending') {
        const embed = message.embeds[0]?.data
        embed.description = `${e.Loading} Doação pendente`
        return message.edit({ embeds: [embed] }).catch(console.log)

    }
    if (status === 'approved') addBonus()

    return message.edit({
        embeds: [{
            color: status === 'approved' ? client.green : client.red,
            title: status === 'cancelled'
                ? `${e.Deny} Doação ${status_detail === 'expired' ? 'expirada' : 'cancelada'}`
                : `${status_detail === 'accredited' ? `${e.Check} Doação recebida` : `${e.Loading} Doação pendente`}`,
            description: status_detail === 'accredited'
                ? `Como a doação foi efetuada com sucesso, eu adicionei **+${Math.ceil(transaction_amount * 5000)} ${await channel.guild.getCoin()}** pra você, ok?`
                : 'Parece que a doação não deu muito certo...'
        }]
    }).catch(console.log)

    async function addBonus() {
        return await Database.User.updateOne(
            { id: metadata.user_id },
            {
                $inc: {
                    Balance: Math.ceil(transaction_amount * 5000)
                }
            },
            { upsert: true }
        )

    }
}