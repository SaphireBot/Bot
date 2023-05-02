import { ButtonStyle, ChannelSelectMenuInteraction, PermissionsBitField } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { Database, SpamManager } from "../../../../classes/index.js"

/**
 * @param { ChannelSelectMenuInteraction } interaction
 * @param { String [] } channelIds
 */
export default async (interaction, channelIds) => {

    const { member, guild, message } = interaction

    if (!member.permissions.has(PermissionsBitField.Flags.Administrator))
        return interaction.reply({
            content: `${e.DenyX} | Apenas **administradores** podem acessar este sistema.`,
            ephemeral: true
        })

    const components = message.components
    await interaction.update({ content: `${e.Loading} | Configurando canais no sistema Anti-Spam...`, components: [] }).catch(() => { })
    await guild.channels.fetch().catch(() => { })
    const availableChannels = []

    for (const channelId of channelIds)
        if (guild.channels.cache.get(channelId))
            availableChannels.push(channelId)

    if (!availableChannels.length)
        return interaction.editReply({
            content: `${e.DenyX} | Os canais selecionados não foram encontrados ou eu não tenho acesso a eles.`,
            components
        }).catch(() => { })

    return await Database.Guild.findOneAndUpdate(
        { id: guild.id },
        { $addToSet: { 'Spam.ignoreChannels': { $each: [...channelIds] } } },
        { upsert: true, new: true }
    )
        .then(doc => {
            SpamManager.guildData[guild.id] = doc.Spam
            const embed = message.embeds[0]?.data
            if (embed) {
                embed.description = doc.Spam.ignoreChannels?.length
                    ? doc.Spam.ignoreChannels.map(channelId => guild.channels.cache.get(channelId)).join(', ') || 'Nenhum Canal Registrado'
                    : 'Nenhum Canal Registrado'
            }
            return interaction.editReply({
                content: null,
                embeds: embed ? [embed] : [],
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 8,
                                custom_id: JSON.stringify({ c: 'spam', src: 'setImuneChannels' }),
                                placeholder: 'Adicionar Canais Imunes (Max: 25)',
                                max_values: 25 - doc.Spam.ignoreChannels,
                                min_values: 1
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
                                label: 'Remover Canais Imunes',
                                emoji: e.Trash,
                                custom_id: JSON.stringify({ c: 'spam', src: 'removeChannels' }),
                                style: ButtonStyle.Primary,
                                disabled: doc.Spam.ignoreChannels?.length == 0
                            }
                        ]
                    }
                ]
            }).catch(() => { })
        })
        .catch(err => interaction.editReply({
            content: `${e.SaphireDesespero} | Não foi possível configurar os canais imunes.\n${e.bug} | \`${err}\``,
            components: [], embeds: []
        }).catch(() => { }))
}