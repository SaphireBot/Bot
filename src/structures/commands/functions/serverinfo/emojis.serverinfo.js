
import { ButtonStyle, Guild, StringSelectMenuInteraction } from "discord.js"
import { SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

/**
 * @param { StringSelectMenuInteraction } interaction
 * @param { Guild } guild
 */
export default async (interaction, guild) => {

    const indexComponent = interaction.message.components.length > 1 ? 1 : 0
    const components = interaction.message.components[indexComponent].toJSON()

    await interaction.update({
        components: [{
            type: 1,
            components: [{
                type: 2,
                label: 'Carregando...',
                emoji: e.Loading,
                custom_id: 'loading',
                style: ButtonStyle.Secondary,
                disabled: true
            }]
        }]
    }).catch(() => { })

    const data = {
        animated: guild.emojis.cache.filter(emoji => emoji.animated).map(emoji => `${emoji}`),
        animatedString: [],
        normal: guild.emojis.cache.filter(emoji => !emoji.animated).map(emoji => `${emoji}`),
        normalString: []
    }

    let description1 = 'Nadinha aqui'

    let control = 0
    if (data.animated.length)
        for (let emoji of data.animated) {
            if (control >= 2680) break;
            data.animatedString.push(emoji)
            control += emoji.length
            continue;
        }

    if (data.animatedString.length)
        description1 = data.animatedString.join(' ')

    const embed = {
        color: client.blue,
        title: '🔎 Informações do Servidor | EMOJIS',
        description: description1,
        fields: [
            {
                name: `${data.animatedString.random() || e.amongusdance} Os Animados`,
                value: `**${guild.name}** tem um total de **${data.animated.length || 0} emojis animados**.${data.animatedString.length < data.animated.length ? '\nLimite da Embed excedido, ainda falta emojis.' : ''}`
            }
        ]
    }

    control = 0
    let description2 = 'Tuuuudo vazio'

    if (data.normal.length)
        for (let emoji of data.normal) {
            if (control >= 2680) break;
            data.normalString.push(emoji)
            control += emoji.length
            continue;
        }

    if (data.normalString.length)
        description2 = data.normalString.join(' ')

    const embed1 = {
        color: client.blue,
        description: description2,
        fields: [
            {
                name: `${data.normalString.random() || '🙂'} Os Normais`,
                value: `**${guild.name}** tem um total de **${data.normal.length || 0} emojis não animados**.${data.normalString.length < data.normal.length ? '\nLimite da Embed excedido, ainda falta emojis.' : ''}`
            }
        ],
        footer: {
            text: `Server ID: ${guild.id}`,
            iconURL: guild.iconURL() || null
        }
    }

    return await interaction.message.edit({ embeds: [embed, embed1], components: [components] }).catch(() => { })
}