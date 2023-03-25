import { SaphireClient as client } from "../../../../../classes/index.js"
import { Emojis as e, Gifs } from "../../../../../util/util.js"

export default async (interaction, gifData) => {

    const { options, user } = interaction
    const gifRequest = options.getString('reaction')
    const text = options.getString('text')
    const option = gifData.find(g => g.JSON === gifRequest)
    const gif = Gifs[gifRequest]?.random() || null

    if (!gif)
        return await interaction.reply({
            content: `${e.Deny} | Não foi possível localizar o GIF.`,
            ephemeral: true
        })

    return await interaction.reply({
        embeds: [{
            color: client.blue,
            image: { url: gif },
            description: text?.limit('MessageEmbedDescription') || option.defaultMessage.replace('$user', user)
        }]
    })
}