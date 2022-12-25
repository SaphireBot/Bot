import { Emojis as e } from "../../../../../util/util.js"
import { SaphireClient as client } from "../../../../../classes/index.js"
import fs from 'fs'

export default async interaction => {

    const { options, user } = interaction
    const anime = options.getString('anime')
    const url = options.getString('url')
    const wallpapers = JSON.parse(fs.readFileSync('./JSON/wallpaperanime.json'))
    const allKeys = Object.keys(wallpapers || {}) || []
    const allValues = Object.values(wallpapers || {}) || []
    const allData = Object.entries(wallpapers || {}) || []

    if (!allKeys.includes(anime))
        return await interaction.reply({
            content: `${e.Deny} | Anime não encontrado. Por favor, selecione um anime da lista ou crie um novo.`,
            ephemeral: true
        })

    if (allValues.flat().includes(url)) {
        const animeData = allData.find(data => data[1].includes(url))

        if (!animeData)
            return await interaction.reply({
                content: `${e.Info} | Este link foi detectado em um anime, porém, não consegui encontrar o anime de origem.`,
                ephemeral: true
            })

        return await interaction.reply({
            content: `${e.Deny} | Este wallpeper já pertence ao anime \`${animeData[0]}\``,
            ephemeral: true
        })
    }

    if (!url.includes('https://cdn.discordapp.com/attachments/') && !url.includes('https://media.discordapp.net/attachments/'))
        return await interaction.reply({
            content: `${e.Deny} | Este não é um link de imagem válido do Discord.`,
            ephemeral: true
        })

    wallpapers[anime].push(url)

    return fs.writeFile(
        './JSON/wallpaperanime.json',
        JSON.stringify(wallpapers, null, 4),
        async (err) => {
            if (err) {
                console.log(err)
                return await interaction.reply({
                    content: `${e.Deny} | Erro ao salvar este anime`,
                    ephemeral: true
                })
            }

            await interaction.reply({
                content: `${e.Check} | Wallpaper adicionado ao anime \`${anime}\` com sucesso.`,
                embeds: [{
                    color: client.green,
                    image: { url },
                    footer: { text: 'Se a imagem não aparecer, o link é inválido.' }
                }],
                ephemeral: true
            })

            return success()
        }
    )

    async function success() {
        return client.sendWebhook(
            process.env.WEBHOOK_DATABASE_PACKAGE,
            {
                username: "[Saphire] Saphire's Database",
                embeds: [{
                    color: client.blue,
                    title: '📥 Novo wallpaper Adicionado',
                    fields: [
                        {
                            name: '📺 Anime',
                            value: anime
                        },
                        {
                            name: '👤 Autor',
                            value: `${user.tag} - \`${user.id}\``
                        }
                    ],
                    image: { url }
                }]
            }
        ).catch(() => { })
    }
}