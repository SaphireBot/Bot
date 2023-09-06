import { StringSelectMenuInteraction, ButtonStyle, PermissionsBitField } from "discord.js";
import { Database, SpamManager, SaphireClient as client } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";

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

    await interaction.update({ content: `${e.Loading} | Carregando cargos configurados...`, components: [], embeds: [] }).catch(() => { })
    const guildData = await SpamManager.getGuildData(guildId)
    let roles = guildData?.Spam?.ignoreRoles || []
    const rolesToIgnore = []

    for (const roleId of roles)
        if (!guild.roles.cache.get(roleId))
            rolesToIgnore.push(roleId)

    if (rolesToIgnore.length)
        await removeInvalidRoles()

    return interaction.editReply({
        content: null,
        embeds: [{
            color: client.blue,
            title: 'Cargos Imunes | Anti-Spam System',
            description: roles?.length
                ? roles.map(roleId => guild.roles.cache.get(roleId)).join(', ') || 'Nenhum Cargo Registrado'
                : 'Nenhum Cargo Registrado'
        }],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 6,
                        custom_id: JSON.stringify({ c: 'spam', src: 'setImuneRoles' }),
                        placeholder: 'Adicionar Cargos Imunes (Max: 25)',
                        max_values: 25 - roles.length
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
                        label: 'Remover Cargos Imunes',
                        emoji: e.Trash,
                        custom_id: JSON.stringify({ c: 'spam', src: 'removeRoles' }),
                        style: ButtonStyle.Primary,
                        disabled: roles.length === 0
                    }
                ]
            }
        ]
    })

    async function removeInvalidRoles() {
        roles = roles.filter(roleId => !rolesToIgnore.includes(roleId))
        await Database.Guild.findOneAndUpdate(
            { id: guildId },
            { $pullAll: rolesToIgnore },
            { new: true }
        )
            .then(data => Database.saveGuildCache(data.id, data))
    }
}