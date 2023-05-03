import { PermissionsBitField, ButtonInteraction, ButtonStyle } from "discord.js"
import { Database, SpamManager } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

/**
 * @param { ButtonInteraction } interaction
 */
export default async interaction => {

    const { member, guild, message } = interaction

    if (!member.permissions.has(PermissionsBitField.Flags.Administrator))
        return interaction.reply({
            content: `${e.DenyX} | Apenas administradores por aqui, ok?`,
            ephemeral: true,
        })

    const components = message.components
    const selectMenu = components.length == 2 ? components[0].toJSON() : null
    await interaction.update({ content: `${e.Loading} | Desativando...`, components: [], embeds: [] }).catch(() => { })

    return await Database.Guild.findOneAndUpdate(
        { id: guild.id },
        { $set: { 'Spam.filters.capsLock.enabled': false } },
        { upsert: true, new: true }
    )
        .then(doc => {
            Database.saveCacheData(doc.id, doc)
            SpamManager.guildData[guild.id] = doc.Spam
            const percent = doc.Spam?.filters?.capsLock?.percent || 0
            const enabled = doc.Spam?.filters?.capsLock?.enabled ?? false
            const buttons = components[components.length - 1].toJSON()

            buttons.components[1] = {
                type: 2,
                label: enabled ? 'Desativar' : 'Ativar',
                emoji: enabled ? e.DenyX : e.CheckV,
                custom_id: JSON.stringify({ c: 'spam', src: enabled ? 'disablePercent' : 'enablePercent' }),
                style: enabled ? ButtonStyle.Danger : ButtonStyle.Success
            }
            return interaction.editReply({
                content: enabled
                    ? `${e.CheckV} | Sistema **ativado** com **${percent}%** de Caps Lock permitido`
                    : `${e.DenyX} | Sistema **desativado** com **${percent}%** de Caps Lock permitido`,
                components: selectMenu ? [selectMenu, buttons] : [buttons]
            })
        })
        .catch(err => interaction.editReply({
            content: `${e.SaphireDesespero} | Não foi possível desativar o Caps Lock Filter.\n${e.bug} | \`${err}\``
        }).catch(() => { }))

}