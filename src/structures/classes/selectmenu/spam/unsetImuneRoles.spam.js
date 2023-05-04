import { ButtonStyle, RoleSelectMenuInteraction, PermissionsBitField } from "discord.js"
import { Database, SpamManager } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

/**
 * @param { RoleSelectMenuInteraction } interaction
 * @param { String[] } rolesId
 */
export default async (interaction, rolesId) => {

    const { member, guild, message } = interaction

    if (
        !member.permissions.has(PermissionsBitField.Flags.Administrator)
        || member.id !== message.interaction?.user?.id
    )
        return interaction.reply({
            content: `${e.DenyX} | Apenas **administradores** podem acessar este sistema.`,
            ephemeral: true
        })

    await interaction.update({ content: `${e.Loading} | Configurando cargo no sistema Anti-Spam..`, components: [] }).catch(() => { })
    await guild.roles.fetch().catch(() => null)

    return await Database.Guild.findOneAndUpdate(
        { id: guild.id },
        { $pullAll: { 'Spam.ignoreRoles': rolesId } },
        { upsert: true, new: true }
    )
        .then(doc => {
            Database.saveGuildCache(doc.id, doc)
            SpamManager.guildData[guild.id] = doc.Spam
            const embed = message.embeds[0]?.data
            if (embed) {
                embed.description = doc.Spam.ignoreRoles?.length
                    ? doc.Spam.ignoreRoles.map(rolId => guild.roles.cache.get(rolId)).join(', ') || 'Nenhum Cargo Registrado'
                    : 'Nenhum Cargo Registrado'
            }

            const comps = [
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
                            disabled: doc.Spam.ignoreRoles?.length >= 25
                        }
                    ]
                }
            ]

            if (doc.Spam.ignoreRoles?.length)
                comps.unshift({
                    type: 1,
                    components: [
                        {
                            type: 3,
                            custom_id: JSON.stringify({ c: 'spam', src: 'unsetImuneRoles' }),
                            placeholder: 'Remover Cargos Imunes (Max: 25)',
                            options: (doc.Spam.ignoreRoles || [])
                                .map(rId => {
                                    const role = guild.roles.cache.get(rId)
                                    if (!role || !role.name || !role.id) return undefined
                                    return { label: role.name, value: role.id, default: (doc.Spam.ignoreRoles || []).includes(rId) }
                                })
                                .filter(i => i) || []
                        }
                    ]
                })

            interaction.editReply({ content: null, embeds: embed ? [embed] : [], components: comps }).catch(() => { })
            return
        })
        .catch(err => interaction.editReply({
            content: `${e.SaphireDesespero} | Não foi possível configurar os cargos imunes.\n${e.bug} | \`${err}\``,
            components: [], embeds: []
        }).catch(() => { }))
}