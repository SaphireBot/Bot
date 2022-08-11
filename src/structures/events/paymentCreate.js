import { AttachmentBuilder } from 'discord.js'
import { Emojis as e } from '../../util/util.js'
import { SaphireClient as client } from '../../classes/index.js'

client.on('paymentCreate', async newPayment => {

    const { point_of_interaction, metadata } = newPayment

    const channel = await client.channels.cache.get(metadata.channel_id)
    if (!channel) return

    const message = await channel.messages.fetch(metadata.message_id)
    if (!message) return

    const user = await channel.guild.members.fetch(metadata.user_id)
    if (!user) return

    const attachment = new AttachmentBuilder(
        Buffer.from(point_of_interaction.transaction_data.qr_code_base64, "base64"),
        { name: 'qrcode.png' }
    )

    return await message.edit({
        embeds: [{
            color: client.blue,
            title: `${e.Loading} Doação pendente`,
            description: `📑 Aguardando pagamento...\n⏳ ${Date.GetTimeout(1200000, Date.now() - 3000, 'R')}`,
            fields: [
                {
                    name: `${e.Commands} Pix - Copie e Cole`,
                    value: `\`\`\`txt\n${point_of_interaction.transaction_data.qr_code}\n\`\`\``
                },
                {
                    name: `${e.qrcode} QR Code`,
                    value: `Abra o app do seu banco e leia o QR Code`
                }
            ],
            image: { url: 'attachment://qrcode.png' }
        }],
        files: [attachment]
    })


})