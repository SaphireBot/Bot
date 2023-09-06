import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js"
import { SaphireClient as client } from "../../../../../../classes/index.js"
import { Emojis as e } from "../../../../../../util/util.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async (interaction, guildData) => {

    const { member } = interaction

    if (!member.permissions.has(PermissionsBitField.Flags.KickMembers, true))
        return interaction.reply({
            content: `${e.DenyX} | Você precisa da permissão **Expulsar Membros** para usar este comando.`,
            ephemeral: true
        })

    const selectMenuDays = {
        type: 1,
        components: [{
            type: 3,
            custom_id: JSON.stringify({ c: 'minday', src: 'days' }),
            placeholder: 'Escolher dias mínimo',
            options: [
                {
                    label: 'Desativar Sistema',
                    emoji: e.Deny,
                    value: 'disable'
                },
                ...[5, 10, 15, 20, 25, 30].map(num => ({
                    label: `${num} Dias`,
                    emoji: '🗓️',
                    value: `${num}`
                }))
            ]
        }]
    }

    const selectMenuPunishment = {
        type: 1,
        components: [{
            type: 3,
            custom_id: JSON.stringify({ c: 'minday', src: 'punishment' }),
            placeholder: 'Punições',
            options: [
                {
                    label: 'Expulsão',
                    emoji: '🦶',
                    description: 'O famoso Kick',
                    value: 'kick'
                },
                {
                    label: 'Banimento',
                    emoji: '🔨',
                    description: 'El Ban que todos idolatram',
                    value: 'ban'
                },
                {
                    label: 'Apenas um aviso (logs)',
                    emoji: '💬',
                    description: 'Um simples aviso no canal de logs',
                    value: 'warn'
                }
            ]
        }]
    }

    const punishment = {
        ban: 'Banimento (ban)',
        kick: 'Expulsão (kick)',
        warn: 'Aviso no canal de logs'
    }[guildData?.MinDay?.punishment] || 'Nenhuma punição definida'

    return interaction.reply({
        embeds: [{
            color: client.blue,
            title: `${e.Animated.SaphireReading} MinDay System Control`,
            description: 'O MinDay é um sistema que controla a entrada de usuários no servidor.\nUsuários com menos de X Dias de conta criada pode ser expulso ou banido.\n*Este sistema é integrado com o GSN, você pode ativar os logs usando o comando \`/logs\`',
            fields: [
                {
                    name: '🗓️ Dias Configurados',
                    value: guildData?.MinDay?.days
                        ? `${guildData?.MinDay?.days} dias`
                        : 'Nenhum dia foi configurado'
                },
                {
                    name: '🔨 Punição',
                    value: punishment
                }
            ]
        }],
        components: [selectMenuDays, selectMenuPunishment]
    })

}