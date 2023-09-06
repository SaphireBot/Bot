import { ApplicationCommandOptionType, ButtonStyle, PermissionFlagsBits, ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import { DiscordPermissons, PermissionsTranslate } from '../../../../util/Constants.js';
import { Emojis as e } from '../../../../util/util.js';
import lauch from './functions/server/lauch.server.js';
import spam from './functions/server/spam.server.js';
import minday from './functions/server/minday.server.js';

export default {
    name: 'server',
    name_localizations: { "pt-BR": 'servidor' },
    description: '[moderation] Configure minhas funções no servidor',
    dm_permission: false,
    type: 1,
    options: [{
        name: 'options',
        name_localizations: { "pt-BR": 'opções' },
        description: 'Opção a ser executada',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
            {
                name: 'Configurar mensagens de boas-vindas',
                value: 'welcome'
            },
            {
                name: 'Configurar mensagens de saída',
                value: 'leave'
            },
            {
                name: 'Configurar sistema Anti-Spam',
                value: 'spam'
            },
            {
                name: '[MinDay] Configurar entrada de membros com X dias de conta criada',
                value: 'minday'
            },
            {
                name: 'Sapphire Chest',
                value: 'chest'
            }
        ]
    }],
    helpData: {},
    apiData: {
        name: "server",
        description: "Um super comando para gerênciar e automatizar o seu servidor.",
        category: "Moderação",
        synonyms: ["servidor"],
        perms: {
            user: [DiscordPermissons.ManageGuild],
            bot: [DiscordPermissons.ManageGuild]
        }
    },
    execute({ interaction, guildData }) {

        const { options, member } = interaction
        const option = options.getString('options')

        const execute = { chest: askChest, spam, minday }[option]
        if (execute) return execute(interaction, guildData)

        if (
            ['welcome', 'leave'].includes(option)
            && !member.permissions.has(PermissionFlagsBits.ManageGuild, true)
        )
            return interaction.reply({
                content: `${e.Deny} | Opa opa! Só quem tem a permissão **${PermissionsTranslate.ManageGuild}** pode gerenciar esse sistema, ok?`,
                ephemeral: true
            })

        return lauch(interaction, guildData, option)
    }
}

/**
 * @param { ChatInputCommandInteraction } interaction 
 */
function askChest(interaction, guildData) {

    return interaction.reply({
        content: `${guildData?.Chest ? e.Animated.SaphireDance : e.Animated.SaphireCry} | O sistema de Sapphire Chest está ${guildData?.Chest ? 'ativado.' : 'desativado.'}`,
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: guildData?.Chest ? 'Desativar' : 'Ativar',
                        emoji: guildData?.Chest ? e.DenyX : e.CheckV,
                        custom_id: JSON.stringify({ c: 'chest', src: guildData?.Chest ? 'disable' : 'enable' }),
                        style: guildData?.Chest ? ButtonStyle.Danger : ButtonStyle.Success,
                        disabled: !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
                    },
                    {
                        type: 2,
                        label: 'O que é Sapphire Chest?',
                        emoji: e.Animated.SaphireQuestion,
                        custom_id: JSON.stringify({ c: 'chest', src: 'info' }),
                        style: ButtonStyle.Primary
                    }
                ]
            }
        ]
    })
}