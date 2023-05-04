import { ButtonStyle, RoleSelectMenuInteraction, PermissionsBitField } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { Database, SpamManager } from "../../../../classes/index.js"

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
    await guild.roles.fetch().catch(() => { })

    return await Database.Guild.findOneAndUpdate(
        { id: guild.id },
        { $addToSet: { 'Spam.ignoreRoles': { $each: rolesId } } },
        { upsert: true, new: true }
    )
        .then(doc => {
            Database.saveGuildCache(doc.id, doc)
            SpamManager.guildData[guild.id] = doc.Spam
            const embed = message.embeds[0]?.data
            if (embed) {
                embed.description = doc.Spam.ignoreRoles?.length
                    ? doc.Spam.ignoreRoles.map(roleId => guild.roles.cache.get(roleId)).join(', ') || 'Nenhum Cargo Registrado'
                    : 'Nenhum Cargo Registrado'
            }

            interaction.editReply({
                content: null,
                embeds: embed ? [embed] : [],
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 6,
                                custom_id: JSON.stringify({ c: 'spam', src: 'setImuneRoles' }),
                                placeholder: 'Adicionar Cargos Imunes (Max: 25)'
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
                                disabled: doc.Spam.ignoreRoles?.length == 0
                            }
                        ]
                    }
                ]
            }).catch(() => { })
            return
        })
        .catch(err => interaction.editReply({
            content: `${e.SaphireDesespero} | Não foi possível configurar os cargos imunes.\n${e.bug} | \`${err}\``,
            components: [], embeds: []
        }).catch(() => { }))
}