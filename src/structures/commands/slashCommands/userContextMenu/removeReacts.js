import { ButtonStyle } from "discord.js"
import { DiscordPermissons, PermissionsTranslate } from "../../../../util/Constants.js"

export default {
    name: 'Remover Reações',
    dm_permission: false,
    category: "context menu",
    type: 3,
    async execute({ interaction, e, client }) {

        const { targetMessage, member, guild } = interaction

        if (!guild.members.me.permissions.has(DiscordPermissons.ManageMessages, true))
            return await interaction.reply({
                content: `${e.Deny} | Eu preciso da permissão **\`${PermissionsTranslate[DiscordPermissons.ManageMessages]}\`** para remover as reações da mensagens.`,
                ephemeral: true
            })

        if (!member.permissions.has(DiscordPermissons.ManageMessages, true))
            return await interaction.reply({
                content: `${e.Deny} | Você precisa da permissão **\`${PermissionsTranslate[DiscordPermissons.ManageMessages]}\`** para executar esse comando.`,
                ephemeral: true
            })

        const reactionCache = targetMessage?.reactions?.cache
        const collectionArray = reactionCache?.toJSON() || []

        if (!reactionCache || !reactionCache?.size || !collectionArray?.length)
            return await interaction.reply({
                content: `${e.Deny} | A [mensagem](${targetMessage.url}) não possui nenhuma reação a ser removida.`,
                ephemeral: true
            })

        const allReactionSize = collectionArray.reduce((pre, cur) => pre + cur.count, 0)
       
        return await interaction.reply({
            embeds: [{
                color: client.blue,
                title: `${e.QuestionMark} Confirmar Ação`,
                description: `${e.Loading} Ao confirmar, eu vou remover **${reactionCache.size} ${reactionCache.size !== 1 ? 'reações' : 'reação'}** da [mensagem](${targetMessage.url}).\n${e.Info} Essa mensagem possui um total de **${allReactionSize} reações.**`
            }],
            ephemeral: true,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Remover Reações',
                            emoji: e.Trash,
                            custom_id: JSON.stringify({ c: 'removeReaction', src: 'delete', messageId: targetMessage.id }),
                            style: ButtonStyle.Danger
                        },
                        {
                            type: 2,
                            label: 'Cancelar Comando',
                            emoji: e.Deny,
                            custom_id: JSON.stringify({ c: 'removeReaction', src: 'cancel' }),
                            style: ButtonStyle.Success
                        }
                    ]
                }
            ]
        })

    }
}