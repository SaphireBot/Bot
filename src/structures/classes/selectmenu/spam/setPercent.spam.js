import { ButtonInteraction, PermissionsBitField, StringSelectMenuInteraction } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { SpamManager, Database } from "../../../../classes/index.js"

/**
 * @param { StringSelectMenuInteraction } interaction
 * @param { 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 55 | 60 | 65 | 70 | 75 | 80 | 85 | 90 | 95 | 100 } value
 */
export default async (interaction, value) => {

    const { member, guildId, message } = interaction

    if (
        !member.permissions.has(PermissionsBitField.Flags.Administrator)
        || member.id !== message.interaction?.user?.id
    )
        return interaction.reply({
            content: `${e.DenyX} | Apenas **administradores** podem acessar este sistema.`,
            ephemeral: true
        })

    const components = message.components
    await interaction.update({ content: `${e.Loading} | Alterando a porcentagem de Caps Lock permitida...`, components: [] }).catch(() => { })
    return await Database.Guild.findOneAndUpdate(
        { id: guildId },
        { $set: { "Spam.filters.capsLock.percent": value } },
        { upsert: true, new: true }
    )
        .then(doc => {
            Database.saveGuildCache(doc.id, doc)
            SpamManager.guildData[guildId] = doc.Spam
            return interaction.editReply({
                content: doc.Spam?.enabled === true
                    ? `${e.CheckV} | Sistema **ativado** com **${value}%** de Caps Lock permitido`
                    : `${e.DenyX} | Sistema **desativado** com **${value}%** de Caps Lock permitido`,
                components
            })
        })
        .catch(err => interaction.editReply({
            content: `${e.Animated.SaphirePanic} | Não foi possível alterar a porcentagem permitida de Caps Lock.\n${e.bug} | \`${err}\``
        }).catch(() => { }))
}