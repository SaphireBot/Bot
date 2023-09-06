import { ChatInputCommandInteraction, ButtonStyle } from 'discord.js'
import { Database, SaphireClient as client } from "../../../../../classes/index.js"
import fullList from "./list.level.js"
import { Emojis as e } from "../../../../../util/util.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    const { options, user } = interaction
    const bg = options.getString('view_wallpaper')
    if (bg == 'full') return fullList(interaction)
    const wallpaper = Database.BgLevel[bg]
    const userData = await Database.getUser(user.id)
    const usersWallpapers = userData?.Walls.Bg || []

    if (!wallpaper)
        return interaction.reply({
            content: `${e.DenyX} | Nenhum wallpaper foi encontrado.`,
            ephemeral: true
        })

    const designer = await client.users.fetch(wallpaper.Designer)
        .then(u => `🖌️ ${u.username} \`(${u.id})\``)
        .catch(() => "")

    const alreadyHas = usersWallpapers.includes(bg)
        ? 'Você já possui esse wallpaper'
        : 'Você não possui esse wallpaper'

    return interaction.reply({
        embeds: [{
            color: usersWallpapers.includes(bg) ? client.green : client.blue,
            title: `🖼️ ${client.user.username}'s Levels Background`,
            description: `🏷️ \`${bg}\` ${wallpaper.Name}\n💰 ${(Number(wallpaper.Price) || 0).currency()} Safiras\n${designer}\n${e.Animated.SaphireReading} ${alreadyHas}`,
            image: { url: wallpaper.Image || null }
        }],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Comprar Wallpaper',
                        emoji: '💳',
                        custom_id: JSON.stringify({ c: 'bg', src: 'buy', id: bg, cmt: designer ? wallpaper.Designer : null }),
                        style: ButtonStyle.Success,
                        disabled: usersWallpapers.includes(bg)
                    },
                    {
                        type: 2,
                        label: 'Cancelar',
                        emoji: e.Trash,
                        custom_id: JSON.stringify({ c: 'delete' }),
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ]
    })
}