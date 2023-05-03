import { ButtonStyle, PermissionsBitField, StringSelectMenuInteraction } from "discord.js"
import { Database, SpamManager, SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

/**
 * @param { StringSelectMenuInteraction } interaction
 */
export default async interaction => {

    const { member, guildId, guild } = interaction
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator))
        return interaction.reply({
            content: `${e.DenyX} | Apenas **administradores** podem acessar este sistema.`,
            ephemeral: true
        })

    await interaction.update({ content: `${e.Loading} | Carregando...`, embeds: [], components: [] }).catch(() => { })
    const guildData = SpamManager.guildData[guildId]
        ? { Spam: SpamManager.guildData[guildId] }
        // : await Database.Guild.findOne({ id: guildId })
        : await Database.getGuild(guildId)

    await guild.channels.fetch()
    let channels = guildData?.Spam?.ignoreChannels || []
    const channelsToRemove = []

    if (channels.length)
        for (const channelId of channels)
            if (!guild.channels.cache.has(channelId))
                channelsToRemove.push(channelId)
            else continue

    if (channelsToRemove.length)
        await removeInvalidChannels()

    return interaction.editReply({
        content: null,
        embeds: [{
            color: client.blue,
            title: 'Canais Imunes | Anti-Spam System',
            description: channels?.length
                ? channels.map(channelId => guild.channels.cache.get(channelId)).join(', ') || 'Nenhum Canal Registrado'
                : 'Nenhum Canal Registrado'
        }],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 8,
                        custom_id: JSON.stringify({ c: 'spam', src: 'setImuneChannels' }),
                        placeholder: 'Adicionar Canais Imunes (Max: 25)',
                        max_values: 25 - (channels.length || 0),
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
                        disabled: channels.length === 0
                    }
                ]
            }
        ]
    })

    async function removeInvalidChannels() {
        channels = channels.filter(id => !channelsToRemove.includes(id))
        await Database.Guild.findOneAndUpdate(
            { id: guildId },
            { $pullAll: channelsToRemove },
            { new: true }
        )
            .then(data => Database.saveCacheData(data.id, data))
        return
    }
}