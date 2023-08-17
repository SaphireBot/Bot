import { ButtonStyle } from "discord.js"
import { DiscordPermissons, PermissionsTranslate } from "../../../../util/Constants.js"
import { Emojis as e } from "../../../../util/util.js"

export default async ({ interaction }) => {

    const { user, member, message } = interaction

    if (!member.permissions.has(DiscordPermissons.Administrator) && message.interaction.user.id !== user.id)
        return await interaction.reply({
            content: `${e.Deny} | Você precisa da permissão **${PermissionsTranslate.Administrator}** ou ser o autor da votação para executar este comando.`,
            ephemeral: true
        })

    return await interaction.reply({
        content: `${e.QuestionMark} | Você só pode revelar o resultado da votação apenas uma vez. Quer mesmo fazer isso?`,
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: "Revelar resultados",
                        custom_id: JSON.stringify({ c: 'poll', type: 'review', messageId: message.id, userId: user.id }),
                        style: ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: "Não revelar agora",
                        custom_id: JSON.stringify({ c: 'delete', userId: user.id }),
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ]
    })

}