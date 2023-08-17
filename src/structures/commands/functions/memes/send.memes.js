import { AttachmentBuilder, WebhookClient, ButtonStyle } from "discord.js"
import { SaphireClient as client, Database } from "../../../../classes/index.js"
import { Config } from "../../../../util/Constants.js"
import { Emojis as e } from "../../../../util/util.js"

const webhook = new WebhookClient({ url: 'https://discord.com/api/webhooks/1061773493932396574/Nn8IcH9erQuyuFIx_zM34AgCVXhNNo4QkKskSSIQ6f3wW6TW08HqekHM52qgVWsPEsuv' })

export default async (interaction) => {

    const { options, user } = interaction
    const file = options.getAttachment('arquivo')
    const attach = new AttachmentBuilder(file.attachment)

    await interaction.reply({ content: `${e.Loading} | Enviando seu meme...` })

    return await webhook.send({
        username: "Memes Manager",
        files: [attach],
        content: `${user.id}`,
    })
        .then(msg => success(msg))
        .catch(async err => await interaction.editReply({ content: `${e.Deny} | Não foi possível enviar seu meme.\n${e.bug} | \`#3544\` - \`${err}\`` }))

    async function success(msg) {
        const { attachments } = msg
        const attach = attachments[0]

        const components = [{
            type: 1,
            components: [{
                type: 2,
                label: 'Ver meme no package',
                emoji: e.boxes,
                url: `https://discord.com/channels/${Config.guildPackageId}/${Config.memesChannelId}/${msg.id}`,
                style: ButtonStyle.Link
            }]
        }]

        save({ msg, attach, messageUrl: components[0].components[0].url })
        if (attach.content_type === 'video/mp4')
            return await interaction.editReply({ content: `${e.Check} O seu meme foi enviado com sucesso.\n🆔 \`${msg.id}\``, files: [file], components })

        return await interaction.editReply({
            content: null,
            embeds: [{
                color: client.green,
                title: `📺 ${client.user.username}'s Memes`,
                description: `${e.Check} O seu meme foi enviado com sucesso.\n🆔 \`${msg.id}\``,
                image: { url: attach.url }
            }],
            components
        })
    }

    async function save({ msg, attach, messageUrl }) {
        const data = {
            id: msg.id,
            approved: false,
            messageUrl,
            userId: user.id,
            attachmentUrl: attach.url
        }

        client.MemesNotApproved.push(data)
        new Database.Memes(data).save()
    }

}