import { ChatInputCommandInteraction, ButtonInteraction, ButtonStyle, PermissionFlagsBits } from "discord.js"
import { Database, SaphireClient as client } from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"

/**
 * @param { ChatInputCommandInteraction | ButtonInteraction } interaction
 */
export default async (interaction, guildData, commandData) => {

    const { user, member, guild } = interaction

    if (!member.permissions.has(PermissionFlagsBits.Administrator))
        return interaction.reply({
            content: `${e.Deny} | Você precisa ser um administrador para usar esse comando, sabia?`,
            ephemeral: true
        })

    if (commandData && user.id !== interaction?.message?.interaction?.user?.id)
        return interaction.reply({
            content: `${e.Deny} | Você não pode clicar aqui, sai sai, xô.`,
            ephemeral: true
        })

    await interaction.reply({ content: `${e.Loading} | Carregando...` })

    if (!guildData)
        guildData = await Database.Guild.findOne({ id: guild.id })

    const data = {
        enable: guildData?.TempCall?.enable || false,
        muteTime: guildData?.TempCall?.muteTime || false
    }

    return interaction.editReply({
        content: `⏱️ | ${client.user.username}'s Tempo em Call\n${e.Info} | Status: ${data.enable ? 'Ativo' : 'Desativado'}`,
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: data.enable ? 'Ativado' : 'Desativado',
                        emoji: data.enable ? e.CheckV : e.DenyX,
                        custom_id: JSON.stringify({ c: 'tcall', src: data.enable ? 'disable' : 'enable' }),
                        style: data.enable ? ButtonStyle.Success : ButtonStyle.Secondary
                    },
                    {
                        type: 2,
                        label: data.muteTime ? 'Salvar Tempo Mutado' : 'Ignorar Tempo Mutado',
                        emoji: data.muteTime ? e.CheckV : e.DenyX,
                        custom_id: JSON.stringify({ c: 'tcall', src: 'muteTime' }),
                        style: data.muteTime ? ButtonStyle.Success : ButtonStyle.Secondary,
                        disabled: !data.enable
                    }
                ]
            }
        ]
    }).catch(() => { })

}