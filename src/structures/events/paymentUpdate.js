import { Emojis as e } from '../../util/util.js'
import { ButtonStyle } from 'discord.js'
import {
    SaphireClient as client,
    Database
} from '../../classes/index.js'

client.on('paymentUpdate', async paymentUpdated => {

    const { status, status_detail, metadata, transaction_amount, id: paymentId } = paymentUpdated

    const channel = await client.channels.fetch(metadata.channel_id || 'undefined').catch(() => null)
    if (!channel) return

    const user = await client.users.fetch(metadata.user_id || 'undefined').catch(() => null)
    if (!user) return

    const message = await channel.messages.fetch(metadata.message_id || 'undefined').catch(() => null)
    if (!message) return

    await Database.Cache.General.push('UPDATE', paymentUpdated)

    const embed = message.embeds[0]?.data || {}
    const sevenDays = 604800000 // 7 Days

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
        accredited: `Muito obrigada por ser um ser humano generoso! Para agradecer a sua generosidade, adicionei **+${Math.ceil(transaction_amount * 5000)} ${await channel.guild.getCoin()}** e **+${Date.stringDate(Math.ceil(transaction_amount * sevenDays))}** de vip na sua conta.`,
        expired: 'Parece que o tempo do pix se foi... Você pode tentar novamente se quiser.',
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
            footer: { text: `PaymentID: ${paymentId} | Status atual: ${atualStatus[status] || atualStatus[status_detail]}` }
        }],
        files: [],
        components: ['Cancelado', 'Creditado', 'Expirado', 'Aprovado'].includes(atualStatus[status])
            ? []
            : [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'PIX Copia e Cola',
                            custom_id: JSON.stringify({ c: 'donate', id: paymentId }),
                            style: ButtonStyle.Primary
                        }
                    ]
                }
            ]
    }).catch(console.log)

    async function addBonus() {

        const vipBonus = Math.ceil(transaction_amount * sevenDays)
        const isVip = await user.isVip()

        const editData = {
            $inc: {
                Balance: Math.ceil(transaction_amount * 5000)
            }
        }

        if (!isVip)
            editData.$set = {
                'Vip.DateNow': Date.now(),
                'Vip.TimeRemaing': vipBonus
            }
        else editData.$inc['Vip.TimeRemaing'] = vipBonus

        return await Database.User.findOneAndUpdate(
            { id: metadata.user_id },
            editData,
            { upsert: true, new: true }
        )
            .then(doc => Database.saveUserCache(doc?.id, doc))

    }
})