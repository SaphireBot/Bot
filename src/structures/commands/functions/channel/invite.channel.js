import { Permissions } from "../../../../util/Constants.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, channel) => {

    const { user, member, guild } = interaction

    if (!guild.clientHasPermission(Permissions.CreateInstantInvite))
        return await interaction.reply({
            content: `${e.Deny} | Eu não tenho permissão para criar convites neste servidor.`,
            ephemeral: true
        })

    if (!member.memberPermissions(Permissions.CreateInstantInvite))
        return await interaction.reply({
            content: `${e.Deny} | Você não tem permissão para criar convites neste servidor.`,
            ephemeral: true
        })

    const invite = await channel.createInvite({
        temporary: false,
        maxAge: 0,
        reason: `${user.username} criou este convite`
    })
        .catch(() => null)

    if (!invite)
        return await interaction.reply({
            content: `${e.Deny} | Não foi possível criar um convite deste canal.`,
            ephemeral: true
        })

    if (!invite?.code)
        return await interaction.reply({
            content: `${e.Deny} | O código do convite não foi encontrado. Por favor, tente novamente.`,
            ephemeral: true
        })

    return await interaction.reply({
        content: `${e.Check} | Convite fresquinho: \`https://discord.gg/${invite.code}\`\n${e.Info} | Por padrão, este link é permanente.`
    })
}