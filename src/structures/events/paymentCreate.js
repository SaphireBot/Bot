import { AttachmentBuilder, ButtonStyle } from 'discord.js'
import { Emojis as e } from '../../util/util.js'
import { SaphireClient as client } from '../../classes/index.js'

client.on('paymentCreate', async newPayment => {

    const { point_of_interaction, metadata, id: paymentId, transaction_amount } = newPayment

    const channel = await client.channels.fetch(metadata.channel_id || 'undefined').catch(() => null)
    if (!channel) return

    const message = await channel.messages.fetch(metadata.message_id || 'undefined').catch(() => null)
    if (!message) return

    const user = await channel.guild.members.fetch(metadata.user_id || 'undefined').catch(() => null)
    if (!user) return

    const attachment = new AttachmentBuilder(
        Buffer.from(point_of_interaction.transaction_data.qr_code_base64, "base64"),
        { name: 'qrcode.png' }
    )

    return await message.edit({
        embeds: [{
            color: client.blue,
            title: `${e.Check} Doação Criada`,
            description: `📑 Aguardando doação...\n⏳ ${Date.GetTimeout(1200000, Date.now() - 3000, 'R')}`,
            fields: [
                {
                    name: `${e.Tax} Valores e Encargos`,
                    value: `Você está doando \`R$ ${metadata?.value?.currency(true)}\` com encargos adicionais de \`R$ ${(transaction_amount - metadata.value).currency(true)} (0,99%)\` totalizando um valor final de \`R$ ${transaction_amount.currency(true)}\``
                },
                {
                    name: `${e.qrcode} QR Code`,
                    value: 'Abra o app do seu banco e leia o QR Code'
                }
            ],
            image: { url: 'attachment://qrcode.png' },
            footer: {
                text: `PaymentID: ${paymentId}`
            }
        }],
        files: [attachment],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'PIX Copia e Cola',
                        custom_id: JSON.stringify({ c: 'donate', id: paymentId }),
                        emoji: e.Commands,
                        style: ButtonStyle.Primary
                    }
                ]
            }
        ]
    })

})