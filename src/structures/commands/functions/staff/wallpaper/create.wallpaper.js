import { Emojis as e } from "../../../../../util/util.js"
import { Config as config } from "../../../../../util/Constants.js"
import { SaphireClient as client } from "../../../../../classes/index.js"
import fs from 'fs'

export default async interaction => {

    const { options, user } = interaction
    const name = options.getString('name')
    const wallpapers = JSON.parse(fs.readFileSync('./src/JSON/wallpaperanime.json'))
    const allKeys = Object.keys(wallpapers || {}) || []

    if (allKeys.includes(name))
        return await interaction.reply({
            content: `${e.Deny} | Este anime já existe.`,
            ephemeral: true
        })

    if (name.includes(' '))
        return await interaction.reply({
            content: `${e.Deny} | O noma do anime não pode conter espaços`,
            ephemeral: true
        })

    wallpapers[name] = []

    return fs.writeFile(
        './src/JSON/wallpaperanime.json',
        JSON.stringify(wallpapers, null, 4),
        async (err) => {
            if (err) {
                console.log(err)
                return await interaction.reply({
                    content: `${e.Deny} | Erro ao criar este anime`,
                    ephemeral: true
                })
            }

            await interaction.reply({
                content: `${e.Check} | O anime \`${name}\` foi criado com sucesso.`,
                ephemeral: true
            })
            return success()
        }
    )

    async function success() {

        const guild = await client.guilds.fetch(config.guildPackageId).catch(() => null)
        if (!guild) return

        const channelLogs = guild.channels.cache.get(config.packageLogs)
        if (!channelLogs) return

        const webhooks = await channelLogs.fetchWebhooks() || []
        const webhook = webhooks.find(wh => wh?.name === 'Saphire\'s Database')
            || await channelLogs.createWebhook({
                name: 'Saphire\'s Database',
                avatar: config.PackageLogsWebhookProfileIcon,
                reason: 'Nenhuma webhook encontrada'
            })
                .catch(() => null)

        if (!webhook) return

        return webhook.send({
            embeds: [{
                color: client.blue,
                title: '🌟 Novo anime criado',
                fields: [
                    {
                        name: '📺 Anime',
                        value: `\`${name}\``
                    },
                    {
                        name: '👤 Autor',
                        value: `${user.tag} - \`${user.id}\``
                    }
                ]
            }]
        })
    }
}