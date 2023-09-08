import { ApplicationCommandOptionType, PermissionsBitField } from 'discord.js'
import { DiscordPermissons, PermissionsTranslate } from '../../../../util/Constants.js'

export default {
    name: 'ban',
    description: '[moderation] Banir usuário',
    dm_permission: false,
    default_member_permissions: `${PermissionsBitField.Flags.BanMembers}`,
    type: 1,
    name_localizations: { "en-US": "ban", 'pt-BR': 'banir' },
    options: [
        {
            name: 'user',
            description: 'O membro ou ID do usuário a ser banido',
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: 'delete_messages',
            description: 'O quanto do histórico de mensagem dessa pessoa deve ser apagado',
            type: ApplicationCommandOptionType.Integer,
            choices: [
                {
                    name: 'Não excluir nenhuma',
                    value: 0
                },
                {
                    name: 'Última hora',
                    value: 3600
                },
                {
                    name: 'Últimas 6 horas',
                    value: 21600
                },
                {
                    name: 'Últimas 24 horas',
                    value: 86400
                },
                {
                    name: 'Últimos 2 dias',
                    value: 172800
                },
                {
                    name: 'Últimos 3 dias',
                    value: 259200
                },
                {
                    name: 'Últimos 4 dias',
                    value: 345600
                },
                {
                    name: 'Últimos 5 dias',
                    value: 432000
                },
                {
                    name: 'Últimos 6 dias',
                    value: 518400
                },
                {
                    name: 'Últimos 7 dias',
                    value: 604800
                }
            ],
            required: true
        },
        {
            name: 'reason',
            description: 'O motivo do banimento, se houver',
            type: ApplicationCommandOptionType.String,
        }
    ],
    helpData: {
        description: 'Comando para banir um usuário'
    },
    apiData: {
        name: "ban",
        description: "O famoso comando para banir alguém",
        category: "Moderação",
        synonyms: ["banir"],
        tags: [],
perms: {
            user: [DiscordPermissons.BanMembers],
            bot: [DiscordPermissons.BanMembers]
        }
    },
    async execute({ interaction, e }) {

        const { user, options, guild, member } = interaction

        if (!guild.members.me.permissions.has(DiscordPermissons.BanMembers))
            return interaction.reply({
                content: `${e.Deny} | Eu preciso da permissão **${PermissionsTranslate.BanMembers}** para executar este comando.`,
                ephemeral: true
            })

        if (!member.permissions.has(DiscordPermissons.BanMembers))
            return interaction.reply({
                content: `${e.Deny} | Você precisa da permissão **${PermissionsTranslate.BanMembers}** para executar este comando.`,
                ephemeral: true
            })

        const userBan = options.getUser('user')
        const deleteMessageSeconds = options.getInteger('delete_messages')
        const reason = options.getString('reason') || 'Nenhuma razão definida'

        const deleteMessageSecondsAsString = [
            {
                name: 'Nenhuma mensagem foi deletada.',
                value: 0
            },
            {
                name: 'Todas as mensagens na última hora foram deletadas.',
                value: 3600
            },
            {
                name: 'Todas as mensagens nas últimas 6 horas foram deletadas.',
                value: 21600
            },
            {
                name: 'Todas as mensagens nas últimas 24 horas foram deletadas.',
                value: 86400
            },
            {
                name: 'Todas as mensagens nos últimos 2 dias foram deletadas.',
                value: 172800
            },
            {
                name: 'Todas as mensagens nos últimos 3 dias foram deletadas.',
                value: 259200
            },
            {
                name: 'Todas as mensagens nos últimos 4 dias foram deletadas.',
                value: 345600
            },
            {
                name: 'Todas as mensagens nos últimos 5 dias foram deletadas.',
                value: 432000
            },
            {
                name: 'Todas as mensagens nos últimos 6 dias foram deletadas.',
                value: 518400
            },
            {
                name: 'Todas as mensagens nos últimos 7 dias foram deletadas.',
                value: 604800
            }
        ].find(obj => obj.value === deleteMessageSeconds)?.name || "Quantidade e tempo de mensagens não identificados."

        const ban = await guild.bans.create(userBan.id, {
            deleteMessageSeconds,
            reason: `${user.username}: ${reason}`
        })
            .then(() => true)
            .catch(err => err)

        if (ban !== true) {

            if (ban?.code === 30035)
                return await interaction.reply({
                    content: `${e.Deny} | Não foi possível banir esse usuário pois o limite máximo de usuário banidos que não estão na guilda foi excedido.`,
                    ephemeral: true
                })

            if (ban?.code === 10026)
                return await interaction.reply({
                    content: `${e.Deny} | Não foi possível banir este usuário pois o banimento é desconhecido.`,
                    ephemeral: true
                })

            if (ban?.code === 40007)
                return await interaction.reply({
                    content: `${e.Deny} | Esse usuário já está banido neste servidor.`,
                    ephemeral: true
                })

            if (ban?.code === 50013)
                return await interaction.reply({
                    content: `${e.Deny} | Eu não tenho permissão para banir este usuário.`,
                    ephemeral: true
                })

            return await interaction.reply({
                content: `${e.Deny} | Não posso banir esse usuário, aconteceu alguma coisa.\n${e.bug} | \`${ban}\``,
                ephemeral: true
            })

        }

        return await interaction.reply({
            content: `${e.Check} | O usuário ${userBan?.username || 'Not Found'} - \`${userBan.id}\` foi banido do servidor${reason ? `\n${e.Info} | Razão informada: \`${reason}\`` : ""}\n${e.Trash} | ${deleteMessageSecondsAsString}`
        })
    }
}