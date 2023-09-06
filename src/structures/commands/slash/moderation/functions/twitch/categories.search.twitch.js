import { ChatInputCommandInteraction } from "discord.js"
import { Emojis as e } from "../../../../../../util/util.js"
import { SaphireClient as client } from "../../../../../../classes/index.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 * @param { { box_art_url: 'imageUrl.jpg', id: 'numberString', name: 'string' } } data
 */
export default async (interaction, data) => {

    if (!data?.length)
        return interaction.editReply({ content: `${e.DenyX} | Nenhum dado encontrado.` }).catch(() => { })

    const description = data
        .map(d => {
            d.url = `https://www.twitch.tv/directory/game/${d.name.replace(/\s/g, '%20')}`
            return d
        })
        .map(d => `[${d.name}](${d.url})`)
        .join('\n')
        .limit('MessageEmbedDescription')

    return interaction.editReply({
        content: null,
        embeds: [{
            color: client.blue,
            title: `${e.twitch} ${client.user.username}'s Twitch Search Categories System`,
            description,
            footer: {
                text: `${data.length} categorias carregadas`
            }
        }]
    })
}