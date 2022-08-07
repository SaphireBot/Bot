import { AttachmentBuilder } from 'discord.js'
import {
    SaphireClient as client,
    Database
} from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'

export default async newPayment => {

    const { point_of_interaction, metadata } = newPayment
    const channel = await client.channels.fetch(metadata.channel_id)
    if (!channel) return

    const buffer = Buffer.from(point_of_interaction.transaction_data.qr_code_base64, "base64");
    const attachment = new AttachmentBuilder(buffer, { name: 'qrcode.png' })

    return channel.send({ files: [attachment] })
        .then(messageAttachment => next(messageAttachment))
        .catch(err => console.log(err))

    async function next(messageAttachment) {
        const QrCodeURL = messageAttachment.attachments.first().url

        if (!QrCodeURL) return console.log("Sem imagem")

        const message = await channel.messages.fetch(metadata.message_id)
        if (!message) return

        const user = await channel.guild.members.fetch(metadata.user_id)
        if (!user) return

        await message.edit({
            embeds: [{
                color: client.blue,
                title: `${e.Check} Donate gerado com sucesso.`,
                description: `${e.Loading} Aguardando pagamento...`,
                fields: [
                    {
                        name: `${e.Commands} Pix Copia e Cola`,
                        value: `\`\`\`txt\n${point_of_interaction.transaction_data.qr_code}\n\`\`\``
                    },
                    {
                        name: '📱 Qr Code',
                        value: `Abra o app do seu banco e leia o Qr Code`
                    }
                ],
                image: { url: QrCodeURL || null }
            }]
        })

        return messageAttachment.delete().catch(() => { })
    }
}