import { GuildMember, Message, PermissionFlagsBits, Role } from 'discord.js';
import { SaphireClient as client, Database } from '../../../../classes/index.js';
import { Emojis as e } from '../../../../util/util.js';

export default {
    name: 'addroles',
    description: 'Adicione vários cargos em vários membros rapidamente',
    aliases: ['addr', 'adicionarcargos'],
    category: "Moderação",
    api_data: {
        tags: [],
        perms: { user: [], bot: [] }
    },
    /**
     * @param { Message } message
     * @param { string[] } args
     */
    async execute(message, args) {

        const { member, guild, guildId } = message

        if (!member.permissions.has(PermissionFlagsBits.ManageRoles, true))
            return message.reply({
                content: `${e.DenyX} | Você não pode utilizar este comando. Permissão necessária: **Gerênciar Cargos**`
            })

        if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles, true))
            return message.reply({
                content: `${e.DenyX} | Eu preciso da permissão **Gerênciar Cargos** para continuar com este comando.`
            })

        if (!args?.length)
            return message.reply({
                embeds: [{
                    color: client.blue,
                    title: "Add Roles",
                    description: "Com este comando é possível adicionar vários cargos a vários membros rapidamente.",
                    fields: [
                        {
                            name: "Exemplo 1",
                            value: `\`${Database.getPrefix(guildId)?.random()}addroles @member @member2 @member3 @member4 @role @role1 @role2 @role3\``
                        },
                        {
                            name: "Exemplo 2",
                            value: `\`${Database.getPrefix(guildId)?.random()}addroles @member @role @member2 @role1 @member3 @role3 @member4 @role2\``
                        },
                        {
                            name: "Exemplo 3",
                            value: `\`${Database.getPrefix(guildId)?.random()}addroles id id id id id id id\``
                        },
                    ]
                }]
            })

        const msg = await message.reply({ content: `${e.Loading} | Identificando todos os membros e cargos...` })

        /**
         * @type { GuildMember[] }
         */
        const members = await message.getMultipleMembers()

        /**
         * @type { Role[] }
         */
        const rolesMentioned = await message.getMultipleRoles()
        const roles = new Map()
        const unavailableRoles = []

        if (rolesMentioned?.length)
            for (const role of rolesMentioned)
                roles.set(role.id, role)

        const botRole = guild.members.me.roles.botRole
        for (const role of Array.from(roles.values())) {
            if (role.managed || role.comparePositionTo(botRole) >= 1) {
                unavailableRoles.push(role)
                roles.delete(role.id)
            }
        }

        if (!members?.length || !roles?.size)
            return msg?.edit({
                content: `${e.DenyX} | Algo de errado não está certo. Eu encontrei **${members?.length} membros**, **${roles?.size} cargos** e **${unavailableRoles.length} cargos acima do meu**.`
            }).catch(() => { })

        msg?.edit({ content: `${e.Loading} | Adicionado ${roles.size} cargos em ${members.length} membros... *(Não tenho permissão para mexer em ${unavailableRoles.length} cargos)*` }).catch(() => { })

        const response = { ok: 0, error: 0 }
        for await (const m of members)
            await m.roles.add(Array.from(roles.values()))
                .then(() => response.ok++)
                .catch(() => response.error++)

        if (!response.ok && !response.error)
            return msg?.edit({ content: `${e.Animated.SaphireQuestion} | Aparentemente eu não obtive nenhum resultado das adições de cargos... Verifica se eu consegui adicionar os cargos por favor?` }).catch(() => { })

        return msg?.edit({ content: `${response.ok ? `${e.CheckV} | ${response.ok} membros receberam ${roles.size} cargos.` : ''}${response.error ? `\n${e.DenyX} | Não foi possível adicionar os cargos em ${response.error} membros.` : ''}${unavailableRoles.length ? `\n${e.DenyX} | ${unavailableRoles.length} cargos estão acima do meu ou não tenho acesso.` : ''}` }).catch(() => { })
    }
}