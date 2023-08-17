import { ButtonStyle } from "discord.js"
import { Database, SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async ({ interaction, method, commandData }) => {

    const { user, message } = interaction
    const customId = commandData?.id

    if (!customId)
        return await interaction.update({
            content: `${e.Deny} | Interaction Bad Formated`
        }).catch(() => { })

    const likeData = { like: 'up', unlike: 'down' }[method]
    const cantadaData = await Database.Cantadas.findOneAndUpdate(
        { id: customId },
        {
            $addToSet: {
                [`likes.${likeData}`]: user.id
            },
            $pull: {
                [`likes.${likeData === "up" ? "down" : "up"}`]: user.id
            }
        },
        { new: true }
    )

    const embed = message?.embeds[0]?.data

    if (!cantadaData && embed) {
        embed.color = client.red
        embed.title = `${e.Info} Cantada não encontrada`
    }

    const components = [
        {
            type: 1,
            components: [
                {
                    type: 2,
                    label: `${cantadaData?.likes?.up?.length || 0}`,
                    emoji: '❤️‍🔥',
                    custom_id: JSON.stringify({ c: 'cantada', src: 'like', id: cantadaData?.id, mc: commandData?.mc || false }),
                    style: ButtonStyle.Success,
                    disabled: !cantadaData
                },
                {
                    type: 2,
                    label: `${cantadaData?.likes?.down?.length || 0}`,
                    emoji: '🖤',
                    custom_id: JSON.stringify({ c: 'cantada', src: 'unlike', id: cantadaData?.id, mc: commandData?.mc || false }),
                    style: ButtonStyle.Danger,
                    disabled: !cantadaData
                },
                {
                    type: 2,
                    emoji: '🔄',
                    custom_id: JSON.stringify({ c: 'cantada', src: 'random', userId: user.id, mc: commandData?.mc || false }),
                    style: ButtonStyle.Primary,
                    disabled: client.cantadas.length <= 1
                },
                {
                    type: 2,
                    emoji: '📨',
                    custom_id: JSON.stringify({ c: 'cantada', src: 'modal' }),
                    style: ButtonStyle.Primary
                }
            ]
        }
    ]

    const cant = client.cantadas.find(c => c.id === cantadaData?.id)
    if (cant) cant.likes = cantadaData?.likes

    return await interaction.update({ components, embeds: cantadaData ? null : [embed] }).catch(() => { })
}