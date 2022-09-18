import {
    SaphireClient as client,
    Database
} from "../../../../classes/index.js"
import { Config as config } from "../../../../util/Constants.js"
import { Emojis as e } from "../../../../util/util.js"

export default async interaction => {

    const { options, user } = interaction
    const indicate = options.getString('indicate')
    const wallpapers = Database.Wallpapers
    const wallpapersKeys = Object.keys(wallpapers || {}) || []

    if (wallpapersKeys.find(key => key.toLowerCase() === indicate?.toLowerCase()))
        return await interaction.reply({
            content: `${e.Deny} | Este wallpaper já existe no pacote.`,
            ephemeral: true
        })

    const packageServer = await client.guilds.fetch(config.guildPackageId).catch(() => null)
    if (!packageServer)
        return await interaction.reply({
            content: `${e.Deny} | Não foi possível encontrar o servidor package.`,
            ephemeral: true
        })

    const channel = packageServer.channels.cache.get(config.wallpaperIndicateChannelId)
    if (!channel)
        return await interaction.reply({
            content: `${e.Deny} | Não foi possível encontrar o canal de envio no servidor package.`,
            ephemeral: true
        })

    const fetchWebhook = await channel.fetchWebhooks()
    const webhook = fetchWebhook.find(web => web.name === 'Anime Wallpaper Suggestion')
        || await channel.createWebhook({
            name: 'Anime Wallpaper Suggestion',
            avatar: config.PackageLogsWebhookProfileIcon,
            reason: 'Nenhuma webhook encontrada'
        })
            .catch(() => null)

    if (!webhook)
        return await interaction.reply({
            content: `${e.Deny} | Não foi possível contactar a webhook de envio.`,
            ephemeral: true
        })

    return webhook.send({
        embeds: [{
            color: client.green,
            title: `💭 Nova indicação de wallpaper`,
            fields: [
                {
                    name: '🖊 Anime indicado',
                    value: `\`${indicate}\``
                },
                {
                    name: '👤 Autor',
                    value: `${user.tag} - *\`${user.id}\`*`
                }
            ]
        }]
    })
        .then(async () => {
            return await interaction.reply({
                content: `${e.Check} | A indicação do anime \`${indicate}\` foi realizada com sucesso. A **${client.user.username}'s Team** irá adicionar assim que possível.`,
                ephemeral: true
            })
        })
        .catch(async err => {
            console.log(err)
            return await interaction.reply({
                content: `${e.Deny} | Não foi possível concluir o envio da sua sugestão. Houve um erro no meio do caminho.`,
                ephemeral: true
            })
        })
}