import { ButtonStyle, PermissionsBitField, StringSelectMenuInteraction } from "discord.js"
import { SpamManager, Database } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

/**
 * @param { StringSelectMenuInteraction } interaction
 */
export default async interaction => {

    const { member, guildId } = interaction

    if (!member.permissions.has(PermissionsBitField.Flags.Administrator))
        return interaction.reply({
            content: `${e.Deny} | Apenas **administradores** podem acessar esta função.`,
            ephemeral: true
        })

    await interaction.update({ content: `${e.Loading} | Carregando informações...`, components: [], embeds: [] }).catch(() => { })

    const guildData = SpamManager.guildData[guildId]
        ? { Spam: SpamManager.guildData[guildId] }
        : await Database.Guild.findOne({ id: guildId })

    const repeat = guildData?.Spam?.filters?.repeat?.enabled || false

    return interaction.editReply({
        content: repeat
            ? `${e.CheckV} | O filtro de mensagens repetidas está **ativado**. Mensagens iguais serão deletadas.`
            : `${e.DenyX} | O filtro de mensagens repetidas está **desativado**. Mensagens iguais não serão deletadas.`,
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Voltar',
                        emoji: e.saphireLeft,
                        custom_id: JSON.stringify({ c: 'spam', src: 'back' }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: repeat ? 'Desativar' : 'Ativar',
                        emoji: repeat ? e.DenyX : e.CheckV,
                        custom_id: JSON.stringify({ c: 'spam', src: repeat ? 'disableRepeat' : 'enableRepeat' }),
                        style: repeat ? ButtonStyle.Danger : ButtonStyle.Success
                    }
                ]
            }
        ]
    }).catch(() => { })

}