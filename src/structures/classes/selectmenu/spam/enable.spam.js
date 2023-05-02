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

    if (SpamManager.guildsEnabled.includes(guildId))
        return interaction.reply({
            content: `${e.Animated.SaphireDance} | O sistema anti-spam já está ativado.`,
            ephemeral: true
        })

    await interaction.update({ content: `${e.Loading} | Ativando sistema Anti-Spam...`, components: [], embeds: [] }).catch(() => { })
    return await Database.Guild.findOneAndUpdate(
        { id: guildId },
        { $set: { 'Spam.enabled': true } },
        { upsert: true, new: true }
    )
        .then(doc => {
            SpamManager.guildData[guildId] = doc.Spam
            if (!SpamManager.guildsEnabled.includes(guildId)) SpamManager.guildsEnabled.push(guildId)
            return interaction.editReply({
                content: `${e.Animated.SaphireDance} | Sistema Anti-Spam ativado com sucesso!`,
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
            }).catch(() => { })
        })
        .catch(err => interaction.editReply({
            content: `${e.SaphireDesespero} | Haaa meu Deus, não foi possível ativar o Anti-Spam.\n${e.bug} | \`${err}\``
        }).catch(() => { }))
}