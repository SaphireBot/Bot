import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';
import { DiscordPermissons, PermissionsTranslate } from '../../../../util/Constants.js';

export default {
    name: 'unban',
    description: '[moderation] Retirar banimento de pessoas do servidor',
    dm_permission: false,
    database: false,
    default_member_permissions: `${PermissionFlagsBits.BanMembers} `,
    type: 1,
    options: [
        {
            name: 'users_banned',
            description: "Usuário a ser desbanido",
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            required: true
        },
        {
            name: 'reason',
            description: 'Razão do desbanimento',
            type: ApplicationCommandOptionType.String
        }
    ],
    helpData: {
        description: 'Sistema simples de desbanimento'
    },
    api_data: {
        name: "unban",
        description: "Baniu errado? Quer desbanir alguém? Esse comando é perfeito para isso.",
        category: "Moderação",
        synonyms: [],
        tags: [],
        perms: {
            user: [DiscordPermissons.BanMembers],
            bot: [DiscordPermissons.BanMembers]
        }
    },
    async execute({ interaction, client, e }) {

        const { user, options, guild, member } = interaction

        if (!guild.members.me.permissions.has(DiscordPermissons.BanMembers))
            return await interaction.reply({
                content: `${e.Deny} | Eu preciso da permissão ** ${PermissionsTranslate.BanMembers}** para executar este comando.`,
                ephemeral: true
            })

        if (!member.permissions.has(DiscordPermissons.BanMembers))
            return await interaction.reply({
                content: `${e.Deny} | Você precisa da permissão ** ${PermissionsTranslate.BanMembers}** para executar este comando.`,
                ephemeral: true
            })

        const userBanned = await client.users.fetch(options.getString('users_banned')).catch(() => null)
        const reason = options.getString('reason') || 'Solicitou o desbanimento'

        if (!userBanned)
            return await interaction.reply({
                content: `${e.Deny} | Nenhum usuário selecionado ou não encontrado.`,
                ephemeral: true
            })

        const result = await guild.bans.remove(userBanned, `${user.username}: ${reason.slice(0, 100)} `)
            .then(() => true)
            .catch(err => err.code)

        if (result !== true) {

            if (result === 10026)
                return await interaction.reply({
                    content: `${e.Deny} | O usuário ${userBanned?.username || "Not Found"} não está banido neste servidor.`,
                    ephemeral: true
                })

            if (result === 'BanResolveId')
                return await interaction.reply({
                    content: `${e.Deny} | Nenhum usuário foi desbanido. Ish...`,
                    ephemeral: true
                })

            return await interaction.reply({
                content: `${e.Deny} | Não foi possível desbanir o usuário ${userBanned?.username || "Not Found"} - \`${userBanned.id}\`\n${e.Warn} | \`${result}\``,
                ephemeral: true
            })
        }

        return await interaction.reply({
            content: `${e.Check} | O usuário ${userBanned.username} \`${userBanned.id}\` foi desbanido com sucesso.`
        })

    }
}