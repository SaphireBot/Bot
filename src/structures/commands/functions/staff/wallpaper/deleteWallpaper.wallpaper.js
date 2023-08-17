import { Emojis as e } from "../../../../../util/util.js"
import { SaphireClient as client } from "../../../../../classes/index.js"
import { ButtonStyle } from "discord.js"
import fs from 'fs'

export default async interaction => {

    const { options, user } = interaction
    const anime = options.getString('anime')
    const wallpapers = JSON.parse(fs.readFileSync('./JSON/wallpaperanime.json'))
    const allKeys = Object.keys(wallpapers || {}) || []

    if (!allKeys.includes(anime))
        return await interaction.reply({
            content: `${e.Deny} | Anime não encontrado. Por favor, selecione um anime da lista ou crie um novo.`,
            ephemeral: true
        })

    let animeData = wallpapers[anime]

    if (!animeData || !animeData.length)
        return await interaction.reply({
            content: `${e.Deny} | Este anime não possui nenhum wallpaper.`,
            ephemeral: true
        })

    let index = 0
    const buttons = [{
        type: 1,
        components: [
            {
                type: 2,
                label: 'Anterior',
                custom_id: 'left',
                style: ButtonStyle.Primary
            },
            {
                type: 2,
                label: `1/${animeData.length}`,
                custom_id: '0',
                style: ButtonStyle.Secondary,
                disabled: true
            },
            {
                type: 2,
                label: 'Próximo',
                custom_id: 'right',
                style: ButtonStyle.Primary
            },
            {
                type: 2,
                label: 'Cancelar',
                custom_id: 'cancel',
                style: ButtonStyle.Success
            },
            {
                type: 2,
                label: 'Deletar',
                custom_id: 'delete',
                style: ButtonStyle.Danger
            }
        ]
    }]

    const embed = {
        color: client.blue,
        title: `${e.QuestionMark} Qual é o wallpaper a ser deletado?`,
        image: { url: animeData[0] }
    }

    const msg = await interaction.reply({
        embeds: [embed],
        components: buttons,
        fetchReply: true
    })

    const collector = msg.createMessageComponentCollector({
        filter: int => int.user.id === user.id,
        idle: 60000,
        errors: ['idle']
    })
        .on('collect', async int => {

            const { customId } = int

            if (customId === 'delete') {
                await deleteWallpaper()
                if (index >= animeData.length) index = animeData.length - 1
            }

            if (customId === 'cancel') return collector.stop()

            if (customId === 'right') {
                index++
                if (index >= animeData.length) index = 0
            }

            if (customId === 'left') {
                index--
                if (index < 0) index = animeData.length - 1
            }

            buttons[0].components[1].label = `${index + 1}/${animeData.length}`
            embed.image.url = animeData[index]
            return await int.update({
                embeds: [embed],
                components: buttons
            }).catch(() => { })
        })
        .on('end', async () => await interaction.deleteReply().catch(() => { }))

    async function deleteWallpaper() {

        wallpapers[anime] = animeData.filter(data => data !== animeData[index])
        animeData = wallpapers[anime]

        return fs.writeFile(
            './JSON/wallpaperanime.json',
            JSON.stringify(wallpapers, null, 4),
            async (err) => {
                if (err) {
                    console.log(err)
                    return await interaction.reply({
                        content: `${e.Deny} | Erro ao deletar este anime`,
                        ephemeral: true
                    })
                }
                return success()
            }
        )

    }

    async function success() {
        return client.sendWebhook(
            process.env.WEBHOOK_DATABASE_PACKAGE,
            {
                username: "[Saphire] Saphire's Database",
                embeds: [{
                    color: client.blue,
                    title: '🚮 Wallpaper deletado',
                    fields: [
                        {
                            name: '📺 Anime',
                            value: `\`${anime}\``
                        },
                        {
                            name: '👤 Autor',
                            value: `${user.username} - \`${user.id}\``
                        }
                    ],
                    image: { url: animeData[index] }
                }]
            }
        ).catch(() => { })

    }

}