import { ButtonStyle, ChannelSelectMenuInteraction, ChannelType, PermissionsBitField } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { Database, SpamManager } from "../../../../classes/index.js"

/**
 * @param { ChannelSelectMenuInteraction } interaction
 * @param { String[] } channelsId
 */
export default async (interaction, channelsId) => {

    const { member, guild, message } = interaction

    if (
        !member.permissions.has(PermissionsBitField.Flags.Administrator)
        || member.id !== message.interaction?.user?.id
    )
        return interaction.reply({
            content: `${e.DenyX} | Apenas **administradores** podem acessar este sistema.`,
            ephemeral: true
        })

    await interaction.update({ content: `${e.Loading} | Configurando canais no sistema Anti-Spam...`, components: [] }).catch(() => { })
    await guild.channels.fetch().catch(() => { })

    return await Database.Guild.findOneAndUpdate(
        { id: guild.id },
        { $pullAll: { 'Spam.ignoreChannels': channelsId } },
        { upsert: true, new: true }
    )
        .then(doc => {
            Database.saveCacheData(doc.id, doc)
            SpamManager.guildData[guild.id] = doc.Spam
            const embed = message.embeds[0]?.data
            if (embed) {
                embed.description = doc.Spam.ignoreChannels?.length
                    ? doc.Spam.ignoreChannels.map(channelId => guild.channels.cache.get(channelId)).join(', ') || 'Nenhum Canal Registrado'
                    : 'Nenhum Canal Registrado'
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
                            label: 'Adicionar Canais Imunes',
                            emoji: '📨',
                            custom_id: JSON.stringify({ c: 'spam', src: 'channels' }),
                            style: ButtonStyle.Primary,
                            disabled: doc.Spam.ignoreChannels?.length >= 25
                        }
                    ]
                }
            ]

            if (doc.Spam.ignoreChannels?.length)
                comps.unshift({
                    type: 1,
                    components: [
                        {
                            type: 3,
                            custom_id: JSON.stringify({ c: 'spam', src: 'unsetImuneChannels' }),
                            placeholder: 'Remover Canais Imunes (Max: 25)',
                            max_values: doc.Spam.ignoreChannels?.length || 1,
                            options: (doc.Spam.ignoreChannels || [])
                                .map(channelId => {
                                    const channel = guild.channels.cache.get(channelId)
                                    if (!channel || !channel.name || !channel.id) return undefined
                                    return {
                                        label: channel.name,
                                        value: channel.id,
                                        emoji: channel.type == ChannelType.GuildVoice ? '🔊' : '💬',
                                        default: doc.Spam.ignoreChannels?.includes(channel.id)
                                    }
                                })
                                .filter(i => i) || []
                        }
                    ]
                })

            interaction.editReply({ content: null, embeds: embed ? [embed] : [], components: comps }).catch(() => { })
            return
        })
        .catch(err => interaction.editReply({
            content: `${e.SaphireDesespero} | Não foi possível configurar os canais imunes.\n${e.bug} | \`${err}\``,
            components: [], embeds: []
        }).catch(() => { }))
}