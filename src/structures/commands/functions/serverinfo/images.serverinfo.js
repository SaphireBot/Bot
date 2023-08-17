import { StringSelectMenuInteraction, Guild, ButtonStyle } from "discord.js";
import { SaphireClient as client } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";

/**
 * @param { StringSelectMenuInteraction } interaction
 * @param { Guild } guild
 */
export default async (interaction, guild) => {

    const indexComponent = interaction.message.components.length > 1 ? 1 : 0
    const selectMenu = interaction.message.components[indexComponent].toJSON()

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

    const images = {
        icon: guild.iconURL({ size: 2048 }),
        banner: guild.bannerURL({ size: 2048 }),
        discovery: guild.discoverySplashURL({ size: 2048 }),
        splash: guild.splashURL({ size: 2048 })
    }

    const embeds = []

    if (images.icon)
        embeds.push({
            color: client.blue,
            description: `[Clique aqui](${images.icon}) para baixar o icone`,
            image: { url: images.icon }
        })

    if (images.banner)
        embeds.push({
            color: client.blue,
            description: `[Clique aqui](${images.banner}) para baixar o banner`,
            image: { url: images.banner }
        })

    if (images.discovery)
        embeds.push({
            color: client.blue,
            description: `[Clique aqui](${images.discovery}) para baixar a imagem do Descobrir`,
            image: { url: images.discovery }
        })

    if (images.splash)
        embeds.push({
            color: client.blue,
            description: `[Clique aqui](${images.splash}) para baixar a imagem de convite`,
            image: { url: images.splash }
        })

    if (embeds.length) {
        embeds[0].title = '🔎 Informações do Servidor | IMAGENS'
        embeds[embeds.length - 1].footer = {
            text: `Server ID: ${guild.id}`,
            iconURL: guild.iconURL() || null
        }
    }

    let content = null
    if (!embeds.length)
        content = `${e.Animated.SaphireCry} | O servidor não possui nenhuma imagem.`

    return interaction.message.edit({ content, embeds, components: [selectMenu] }).catch(() => { })
}