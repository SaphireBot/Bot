import { ChatInputCommandInteraction, PermissionsBitField, ButtonInteraction } from "discord.js"
import { SaphireClient as client, SpamManager } from "../../../../../../classes/index.js"
import { Emojis as e } from "../../../../../../util/util.js"

/**
 * @param { ChatInputCommandInteraction | ButtonInteraction } interaction
 */
export default async (interaction, guildData, toEdit) => {

    const { member, guildId } = interaction

    if (!member.permissions.has(PermissionsBitField.Flags.Administrator))
        return interaction.reply({
            content: `${e.DenyX} | Apenas **administradores** podem acessar este sistema.`,
            ephemeral: true
        })

    guildData = guildData || await SpamManager.getGuildData(guildId)

    const data = guildData?.Spam || {}
    const enabled = data?.enabled || false
    const filters = data.filters || {}
    const bool = b => b ? e.CheckV : e.DenyX
    const filtersEnabled = `${bool(filters.capsLock?.enabled)} Caps Lock\n${bool(filters.messagesTimer?.enabled)} Mensagens por Segundo\n${bool(filters.repeat?.enabled)} Mensagens Repetidas`

    const feedback = {
        content: null,
        embeds: [{
            color: client.blue,
            title: '💬 Central de Configuração Anti-Spam',
            description: enabled
                ? `${e.Animated.SaphireDance} O Sistema Anti-Spam está Ativado`
                : `${e.Animated.SaphireCry} O Sistema Anti-Spam está Destivado`,
            fields: [
                {
                    name: '🪄 Filtros Ativados',
                    value: filtersEnabled
                },
                {
                    name: '🗂️ Cargos Imunes',
                    value: data.ignoreRoles?.length
                        ? data.ignoreRoles.map(roleId => `<@&${roleId}>`).join(', ') || 'Nenhum cargo registrado'
                        : 'Nenhum cargo registrado'
                },
                {
                    name: '🗺️ Canais Imunes',
                    value: data.ignoreChannels?.length
                        ? data.ignoreChannels.map(channelId => `<#${channelId}>`).join(', ') || 'Nenhum canal registrado'
                        : 'Nenhum canal registrado'
                }
            ],
            footer: {
                text: `❤️ Powered by: ${client.user.username}'s Security System`
            }
        }],
        components: [
            {
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'spam',
                    placeholder: 'Configurações de Anti-Spam',
                    options: [
                        {
                            label: 'O que é este sistema?',
                            description: 'Mais informações sobre o sistema de Anti-Spam',
                            emoji: e.Animated.SaphireQuestion,
                            value: 'info'
                        },
                        {
                            label: enabled ? 'Desativar Sistema' : 'Ativar Sistema',
                            description: 'Ativa/Desative este sistema',
                            emoji: enabled ? e.CheckV : e.DenyX,
                            value: enabled ? 'disable' : 'enable'
                        },
                        {
                            label: 'Filtro CAPS LOCK',
                            description: 'Escolha uma porcentagem permitida de CAPS LOCK',
                            emoji: '🇨',
                            value: 'capslock'
                        },
                        {
                            label: 'Filtro Mensagens por Segundo',
                            description: `Só pode enviar ${data.filters?.messagesTimer?.amount || 'X'} Mensagens em ${data.filters?.messagesTimer?.seconds || 'X'} Segundos`,
                            emoji: '⌨️',
                            value: 'messages'
                        },
                        {
                            label: 'Mensagens Repetidas',
                            description: 'Mensagens iguais são chatas, não?',
                            emoji: '💬',
                            value: 'repeat'
                        },
                        {
                            label: 'Configurar Canais Imunes',
                            description: 'Esses canais são imunes a este sistema',
                            emoji: '📝',
                            value: 'channels'
                        },
                        {
                            label: 'Configurar Cargos Imunes',
                            description: 'Esses cargos são imunes a este sistema',
                            emoji: '🛡️',
                            value: 'roles'
                        }
                    ]
                }]
            }
        ]
    }

    return toEdit ? interaction.update(feedback).catch(() => { }) : interaction.reply(feedback)

}