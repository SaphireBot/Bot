import { ButtonStyle, PermissionsBitField, StringSelectMenuInteraction } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { Database, SpamManager } from "../../../../classes/index.js"

/**
 * @param { StringSelectMenuInteraction } interaction
 */
export default async interaction => {

    const { member, guildId } = interaction
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator))
        return interaction.reply({ content: `${e.Deny} | Só adms por aqui, ok?`, ephemeral: true })

    if (!SpamManager.guildsEnabled.includes(guildId))
        return interaction.reply({
            content: `${e.Animated.SaphireDance} | O sistema anti-spam já está desativado.`,
            ephemeral: true
        })

    await interaction.update({ content: `${e.Loading} | Desativando sistema Anti-Spam...`, components: [], embeds: [] }).catch(() => { })
    return await Database.Guild.findOneAndUpdate(
        { id: guildId },
        { $set: { 'Spam.enabled': false } },
        { upsert: true, new: true }
    )
        .then(doc => {
            Database.saveCacheData(doc.id, doc)
            delete SpamManager.guildData[guildId]
            if (SpamManager.guildsEnabled.includes(guildId))
                SpamManager.guildsEnabled = SpamManager.guildsEnabled.filter(gId => gId !== guildId)

            return interaction.editReply({
                content: `${e.Animated.SaphireCry} | O Sistema Anti-Spam desativado!`,
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        label: 'Voltar',
                        emoji: e.saphireLeft,
                        custom_id: JSON.stringify({ c: 'spam', src: 'back' }),
                        style: ButtonStyle.Primary
                    }]
                }]
            })
        })
        .catch(err => interaction.editReply({
            content: `${e.SaphireDesespero} | Haaa meu Deus, não foi possível desativar o Anti-Spam.\n${e.bug} | \`${err}\``
        }).catch(() => { }))
}