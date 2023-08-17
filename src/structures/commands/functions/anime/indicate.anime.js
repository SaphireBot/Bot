import { SaphireClient as client, Database } from "../../../../classes/index.js"
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

    return client.sendWebhook(
        process.env.WEBHOOK_ANIME_WALLPAPERS,
        {
            username: '[Saphire] Anime Wallpaper Sugestion',
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
                        value: `${user.username} - *\`${user.id}\`*`
                    }
                ]
            }]
        }
    )
        .then(async () => {
            return await interaction.reply({
                content: `${e.Check} | A indicação do anime \`${indicate}\` foi realizada com sucesso. A **${client.user.username}'s Team** irá adicionar assim que possível.`,
                ephemeral: true
            })
        })
        .catch(async err => {
            return await interaction.reply({
                content: `${e.Deny} | Não foi possível concluir o envio da sua sugestão. Houve um erro no meio do caminho.\n${err}`.limit("MessageContent"),
                ephemeral: true
            })
        })
}