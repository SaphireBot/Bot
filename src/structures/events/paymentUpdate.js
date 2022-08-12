import { Emojis as e } from '../../util/util.js'
import {
    SaphireClient as client,
    Database
} from '../../classes/index.js'

client.on('paymentUpdate', async paymentUpdated => {

    const { status, status_detail, metadata, transaction_amount } = paymentUpdated

    const channel = client.channels.cache.get(metadata.channel_id)
    if (!channel) return

    const user = await channel.guild.members.fetch(metadata.user_id)
    if (!user) return

    const message = await channel.messages.fetch(metadata.message_id)
    if (!message) return

    await Database.Cache.General.push('UPDATE', paymentUpdated)

    const embed = message.embeds[0]?.data || {}

    const title = {
        approved: `${e.Check} Doação aprovada`,
        pending: `${e.Loading} Aguardando doação...`,
        cancelled: `${e.Deny} Doação cancelada`
    }

    const colors = {
        approved: client.green,
        pending: client.blue,
        cancelled: client.red
    }

    const image = {
        pending_waiting_transfer: embed.image?.url,
        accredited: null,
        expired: null
    }

    const atualStatus = {
        approved: 'Aprovado',
        pending: 'Pendente',
        cancelled: 'Cancelado',
        pending_waiting_transfer: 'Pendente',
        accredited: 'Creditado',
        expired: 'Expirado'
    }

    const description = {
        accredited: `Muito obrigada por ser um ser humano generoso! Para agradecer a sua generosidade, adicionei **+${Math.ceil(transaction_amount * 5000)} ${await channel.guild.getCoin()}** na sua conta.`,
        expired: `Parece que o tempo do pix se foi... Você pode tentar novamente se quiser.`,
        pending_waiting_transfer: `📑 | Doação pendente\n⌛ ${Date.GetTimeout(new Date(paymentUpdated.date_of_expiration).valueOf(), 0, 'R')}`
    }

    const fields = {
        approved: [],
        pending: embed.fields || [],
        cancelled: []
    }

    if (status === 'approved') addBonus()

    return message.edit({
        embeds: [{
            color: colors[status],
            title: title[status],
            description: description[status_detail],
            fields: fields[status],
            image: { url: image[status_detail] },
            footer: { text: `Status atual: ${atualStatus[status] || atualStatus[status_detail]}` }
        }],
        files: []
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
})