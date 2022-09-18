import { Emojis as e } from "../../../../../util/util.js"
import { Config as config } from "../../../../../util/Constants.js"
import { SaphireClient as client } from "../../../../../classes/index.js"
import fs from 'fs'
import { ButtonStyle } from "discord.js"

export default async interaction => {

    const { options, user } = interaction
    const anime = options.getString('anime')
    const wallpapers = JSON.parse(fs.readFileSync('./src/JSON/wallpaperanime.json'))
    const allKeys = Object.keys(wallpapers || {}) || []

    if (!allKeys.includes(anime))
        return await interaction.reply({
            content: `${e.Deny} | Anime não encontrado. Por favor, selecione um anime da lista ou crie um novo.`,
            ephemeral: true
        })

    const animeData = wallpapers[anime]

    const msg = await interaction.reply({
        content: `${e.QuestionMark} | Você realmente deseja deletar o anime \`${anime}\`? Ele possui \`${animeData.length || 0}\` wallpapers.`,
        components: [{
            type: 1,
            components: [
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
        }],
        fetchReply: true
    })

    const collector = msg.createMessageComponentCollector({
        filter: int => int.user.id === user.id,
        time: 60000,
        errors: ['time']
    })
        .on('collect', int => {

            const { customId } = int
            collector.stop()

            if (customId === 'delete')
                return executeDelete()
        })
        .on('end', async () => await interaction.deleteReply().catch(() => { }))

    function executeDelete() {
        delete wallpapers[anime]
        return fs.writeFile(
            './src/JSON/wallpaperanime.json',
            JSON.stringify(wallpapers, null, 4),
            async (err) => {
                if (err) {
                    console.log(err)
                    return await interaction.followUp({
                        content: `${e.Deny} | Erro ao deletar este anime`,
                        ephemeral: true
                    })
                }

                await interaction.followUp({
                    content: `${e.Trash} | O anime \`${anime}\` foi deletado com sucesso.`,
                    ephemeral: true
                })
                return success()
            }
        )
    }

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
                title: '🚮 Anime deletado do pacote de wallpapers',
                fields: [
                    {
                        name: '📺 Anime',
                        value: `\`${anime}\``
                    },
                    {
                        name: '👤 Autor',
                        value: `${user.tag} - \`${user.id}\``
                    },
                    {
                        name: '🖼 Wallpapers',
                        value: `${animeData.length || 0} wallpapers`
                    }
                ]
            }]
        })
    }
}