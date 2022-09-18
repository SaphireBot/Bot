import { ButtonStyle } from 'discord.js'
import { Emojis as e } from '../../../../util/util.js'
import {
    SaphireClient as client,
    Database
} from '../../../../classes/index.js'
import indicateAnime from './indicate.anime.js'

export default async interaction => {

    const { options, user } = interaction
    const indicate = options.getString('indicate') || null

    if (indicate) return indicateAnime(interaction)

    const wallpapers = Database.Wallpapers
    const query = options.getString('search') || 'all'
    const wallpaperOnQuery = []

    if (query === 'all') wallpaperOnQuery.push(...Object.values(wallpapers || {}).flat())

    wallpaperOnQuery.push(...Object.values(wallpapers[query] || {}))

    if (!wallpaperOnQuery || !wallpaperOnQuery.length)
        return await interaction.reply({
            content: `${e.Deny} | Nenhum wallpaper foi encontrado.`,
            ephemeral: true
        })

    let index = 0

    const components = {
        type: 1,
        components: [
            {
                type: 2,
                label: 'Pra cá',
                emoji: e.saphireLeft,
                custom_id: 'left',
                style: ButtonStyle.Primary
            },
            {
                type: 2,
                label: 'Qualquer um',
                emoji: e.saphireLendo,
                custom_id: 'random',
                style: ButtonStyle.Primary
            },
            {
                type: 2,
                label: 'Pra lá',
                emoji: e.saphireRight,
                custom_id: 'right',
                style: ButtonStyle.Primary
            },
            {
                type: 2,
                label: 'Download',
                emoji: e.Download,
                style: ButtonStyle.Link,
                url: wallpaperOnQuery[0]
            }
        ]
    }

    const embed = {
        color: client.blue,
        title: `🖥 ${client.user.username}'s Animes Wallpapers`,
        description: `🔎 Anime selecionado: \`${query === 'all' ? 'Todos' : query}\`\n${e.Info} Alguns wallpapers estão na qualidade 4K. As vezes, demora um pouco para aparecer a imagem.`,
        image: {
            url: wallpaperOnQuery[0]
        },
        footer: { text: `Animes nesta listagem: 1/${wallpaperOnQuery.length}` }
    }

    const msg = await interaction.reply({
        embeds: [embed],
        components: [components],
        fetchReply: true
    })

    return msg.createMessageComponentCollector({
        filter: int => int.user.id === user.id,
        idle: 60000
    })
        .on('collect', async int => {

            const { customId } = int

            if (customId === 'right') {
                index++
                if (index >= wallpaperOnQuery.length) index = 0
            }

            if (customId === 'left') {
                index--
                if (index <= 0) index = wallpaperOnQuery.length - 1
            }

            if (customId === 'random') {
                index = Math.floor(Math.random() * wallpaperOnQuery.length)
                if (index <= 0) index = wallpaperOnQuery.length - 1
                if (index >= wallpaperOnQuery.length) index = 0
            }

            embed.image.url = wallpaperOnQuery[index]
            embed.footer.text = `Animes nesta listagem: ${index + 1}/${wallpaperOnQuery.length}`
            components.components[3].url = wallpaperOnQuery[index]

            return await int.update({ embeds: [embed], components: [components] })
        })
        .on('end', async () => {
            embed.color = client.red
            embed.footer.text = embed.footer.text + ' | Finalizado'
            return await msg.edit({ embeds: [embed], components: [] }).catch(() => { })

        })

}