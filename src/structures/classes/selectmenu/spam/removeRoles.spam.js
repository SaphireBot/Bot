import { ButtonStyle, PermissionsBitField, StringSelectMenuInteraction } from "discord.js"
import { Database, SpamManager, SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

/**
 * @param { StringSelectMenuInteraction } interaction
 */
export default async interaction => {

    const { member, guildId, guild, message } = interaction

    if (
        !member.permissions.has(PermissionsBitField.Flags.Administrator)
        || member.id !== message.interaction?.user?.id
    )
        return interaction.reply({
            content: `${e.DenyX} | Apenas **administradores** podem acessar este sistema.`,
            ephemeral: true
        })

    await interaction.update({ content: `${e.Loading} | Carregando...`, embeds: [], components: [] }).catch(() => { })
    const guildData = SpamManager.guildData[guildId]
        ? { Spam: SpamManager.guildData[guildId] }
        // : await Database.Guild.findOne({ id: guildId })
        : await Database.getGuild(guildId)

    await guild.roles.fetch().catch(() => { })
    let roles = guildData?.Spam?.ignoreRoles || []
    const rolesToRemove = []

    if (roles.length)
        for (const roleId of roles)
            if (!guild.roles.cache.has(roleId))
                rolesToRemove.push(roleId)
            else continue

    if (rolesToRemove.length)
        await removeInvalidRoles()

    return interaction.editReply({
        content: null,
        embeds: [{
            color: client.blue,
            title: 'Cargos Imunes | Anti-Spam System',
            description: roles?.length
                ? roles.map(rId => guild.roles.cache.get(rId)).join(', ') || 'Nenhum Cargo Registrado'
                : 'Nenhum Cargo Registrado'
        }],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 3,
                        custom_id: JSON.stringify({ c: 'spam', src: 'unsetImuneRoles' }),
                        placeholder: 'Remover Cargos Imunes (Max: 25)',
                        max_values: roles.length,
                        options: roles
                            .map(roleId => {
                                const role = guild.roles.cache.get(roleId)
                                if (!role || !role.name || !role.id) return undefined
                                return { label: role.name, value: role.id }
                            })
                            .filter(i => i) || []
                    }
                ]
            },
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
                        label: 'Adicionar Cargos Imunes',
                        emoji: '📨',
                        custom_id: JSON.stringify({ c: 'spam', src: 'roles' }),
                        style: ButtonStyle.Primary,
                        disabled: roles.length === 0
                    }
                ]
            }
        ]
    })

    async function removeInvalidRoles() {
        roles = roles.filter(id => !rolesToRemove.includes(id))
        await Database.Guild.findOneAndUpdate(
            { id: guildId },
            { $pullAll: rolesToRemove },
            { new: true }
        )
            .then(data => Database.saveCacheData(data.id, data))
        return
    }
}