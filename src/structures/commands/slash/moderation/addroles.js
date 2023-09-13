import { ApplicationCommandOptionType, GuildMember, PermissionFlagsBits, PermissionsBitField, Role } from 'discord.js';
import { DiscordPermissons } from '../../../../util/Constants.js';
import { Emojis as e } from '../../../../util/util.js';

export default {
    name: 'addroles',
    description: '[moderation] Adicione vários cargos a vários usuários de uma só vez',
    dm_permission: false,
    default_member_permissions: `${PermissionsBitField.Flags.ManageRoles}`,
    database: false,
    type: 1,
    options: [
        {
            name: 'members',
            description: 'Todos os usuários que irão receber os cargos',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'roles',
            description: 'Todos os cargos que serão adicionados aos usuários',
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    api_data: {
        name: "addroles",
        description: "Adicione vários cargos em vários usuários de uma só vez",
        category: "Moderação",
        synonyms: [],
        tags: [],
        perms: {
            user: [DiscordPermissons.ManageRoles],
            bot: [DiscordPermissons.ManageRoles]
        }
    },
    async execute({ interaction }) {

        const { member, guild, options } = interaction

        if (!member.permissions.has(PermissionFlagsBits.ManageRoles, true))
            return interaction.reply({
                content: `${e.DenyX} | Você não pode utilizar este comando. Permissão necessária: **Gerênciar Cargos**`,
                ephemeral: true
            })

        if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles, true))
            return interaction.reply({
                content: `${e.DenyX} | Eu preciso da permissão **Gerênciar Cargos** para continuar com este comando.`,
                ephemeral: true
            })

        /**
         * @type { GuildMember[] }
         */
        const members = await formatMentions(options.getString('members'), 'members')

        /**
         * @type { Role[] }
         */
        const rolesMentioned = await formatMentions(options.getString('roles'), 'roles')
        await interaction.reply({ content: `${e.Loading} | Identificando todos os membros e cargos...` })
        const roles = new Map()
        const unavailableRoles = []

        if (rolesMentioned?.length)
            for (const role of rolesMentioned)
                roles.set(role.id, role)

        const botRole = guild.members.me.roles.botRole
        for await (const role of Array.from(roles.values()))
            if (role.managed || role.comparePositionTo(botRole) >= 1) {
                unavailableRoles.push(role)
                roles.delete(role.id)
            }

        if (!members?.length || !roles?.size)
            return interaction.editReply({
                content: `${e.DenyX} | Algo de errado não está certo. Eu encontrei **${members?.length} membros**, **${roles?.size} cargos** e **${unavailableRoles.length} cargos acima do meu**.`
            }).catch(() => { })

        await interaction.editReply({ content: `${e.Loading} | Adicionado ${roles.size} cargos em ${members.length} membros... *(Não tenho permissão para mexer em ${unavailableRoles.length} cargos)*` }).catch(() => { })

        const response = { ok: 0, error: 0 }
        for await (const m of members)
            await m.roles.add(Array.from(roles.values()))
                .then(() => response.ok++)
                .catch(() => response.error++)

        if (!response.ok && !response.error)
            return interaction.editReply({ content: `${e.Animated.SaphireQuestion} | Aparentemente eu não obtive nenhum resultado das adições de cargos... Verifica se eu consegui adicionar os cargos por favor?` }).catch(() => { })

        return interaction.editReply({ content: `${response.ok ? `${e.CheckV} | ${response.ok} membros receberam ${roles.size} cargos.` : ''}${response.error ? `\n${e.DenyX} | Não foi possível adicionar os cargos em ${response.error} membros.` : ''}${unavailableRoles.length ? `\n${e.DenyX} | ${unavailableRoles.length} cargos estão acima do meu ou não tenho acesso.` : ''}` }).catch(() => { })

        async function formatMentions(string = "", type) {
            const ids = new Set()

            for (const id of string.split(" ")) {
                const i = id.match(/\d+/g)
                if (i)
                    ids.add(i[0])
                continue
            }

            const allIds = Array.from(ids).filter(i => i)
            if (!allIds.length) return []

            const targets = new Map()

            for await (const id of allIds) {
                if (type == 'members')
                    targets.set(
                        id,
                        guild.members.cache.get(id)
                        || await guild.members.fetch(id).catch(() => undefined)
                    )

                if (type == 'roles')
                    targets.set(
                        id,
                        guild.roles.cache.get(id)
                        || await guild.roles.fetch(id).catch(() => undefined)
                    )
            }

            return Array.from(targets.values()).filter(i => i)
        }
    }
}