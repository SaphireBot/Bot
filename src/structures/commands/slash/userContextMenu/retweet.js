import { DiscordPermissons, PermissionsTranslate } from "../../../../util/Constants.js"

export default {
    name: 'Retweet',
    category: "context menu",
    dm_permission: false,
    helpData: {
        color: 'Blue',
        description: 'Clique na mensagem e envie ela novamente',
        permissions: [],
        fields: []
    },
    type: 3,
    api_data: {
        name: "Retweet",
        description: "Retweet uma mensagem como se você tivesse enviado (Comando Fechado)",
        category: "Diversão",
        synonyms: [],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, e, client }) {

        return interaction.reply({
            content: `${e.Animated.SaphireSleeping} | Comando fechado por causa de usuários safadinhos...`,
            ephemeral: true
        })

        const { targetMessage: message, channel, guild, member } = interaction

        if (!guild.members.me.permissions.has(DiscordPermissons.ManageWebhooks, true))
            return await interaction.reply({
                content: `${e.Deny} | Eu preciso da permissão **\`${PermissionsTranslate.ManageWebhooks}\`** para executar este comando.`
            })

        if (message.partial) await message.fetch()

        const webhookFetch = await channel.fetchWebhooks().catch(() => null)

        const webhook = webhookFetch?.find(w => w?.name === client.user.id)
            || await channel.createWebhook({
                name: client.user.id,
                avatar: process.env.WEBHOOK_GSN_AVATAR,
                reason: 'No Webhook found'
            }).catch(() => null)

        if (!webhook || !webhook?.url)
            return await interaction.reply({
                content: `${e.Deny} | Não foi possível obter a webhook de envio neste canal.`
            })

        const res = await client.sendWebhook(
            webhook.url,
            {
                username: member.displayName,
                avatarURL: member.displayAvatarURL({ dinamic: true }),
                content: message.content,
                files: message.attachments
            }
        )

        if (res === true)
            return await interaction.reply({
                content: `${e.Check} | Retweet efetuado.`,
                ephemeral: true
            })

        return await interaction.reply({
            content: `${e.Deny} | Não foi possível enviar a mensagem via webhook.\n${e.bug} | \`${res}\``
        })


    }
}