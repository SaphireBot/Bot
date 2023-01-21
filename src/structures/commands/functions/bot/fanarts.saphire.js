import { ButtonStyle } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import {
    Database,
    SaphireClient as client
} from "../../../../classes/index.js"

export default async (interaction, data, toUpdate) => {

    const { message, user: interactionUser } = interaction
    if (["like", "unlike"].includes(data?.src)) return newLike()

    if (message && message?.interaction?.user?.id !== interactionUser.id) return

    const fanartsData = client.fanarts
    if (!fanartsData || !fanartsData?.length)
        return await interaction.reply({
            content: `${e.Deny} | Nenhuma fanarts foi registrada no banco de dados.`,
            ephemeral: true
        })

    const index = parseInt(interaction?.options?.getString('view')) || data?.index || 0
    const fanart = fanartsData[index] ? fanartsData[index] : fanartsData[data?.id] ? fanartsData[data?.id] : fanartsData[0]
    const user = await client.users.fetch(fanart?.userId)

    if (!fanart?.url)
        return await interaction.reply({
            content: `${e.Deny} | URL da imagem não encontrada.`,
            ephemeral: true
        })

    const fields = [
        {
            name: "🏷️ Imagem",
            value: `\`${fanart?.id || 0}\` - ${fanart?.name || 'Name Not Found'}`
        }
    ]

    if (fanart.socialUrl)
        fields[0].value += `\n📷 [Rede social de ${user?.tag || "\`Not Found\`"}](${fanart.socialUrl})`

    const responseData = {
        embeds: [{
            color: client.blue,
            title: "🖌 Fanarts - Saphire",
            description: `Essa fanart foi feita por **${user?.tag || "`Not Found`"}** - \`${fanart?.userId || 0}\``,
            fields,
            image: {
                url: fanart?.url || null
            }
        }],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: `${fanart?.like?.length || 0}`,
                        emoji: e.Upvote,
                        custom_id: JSON.stringify({ c: 'fanart', src: "like", id: fanart.id }),
                        style: ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: `${fanart?.unlike?.length || 0}`,
                        emoji: e.DownVote,
                        custom_id: JSON.stringify({ c: 'fanart', src: "unlike", id: fanart.id }),
                        style: ButtonStyle.Danger
                    },
                    {
                        type: 2,
                        emoji: '⬅',
                        custom_id: JSON.stringify({ c: 'fanart', src: "left", index: index <= 0 ? fanartsData?.length - 1 : index - 1, id: fanart.id }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: '➡',
                        custom_id: JSON.stringify({ c: 'fanart', src: "right", index: index >= fanartsData?.length - 1 ? 0 : index + 1, id: fanart.id }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: '🔎',
                        url: fanart?.url,
                        style: ButtonStyle.Link
                    }
                ]
            }
        ]
    }

    return toUpdate
        ? await interaction.update(responseData)?.catch(() => { })
        : await interaction.reply(responseData)

    async function newLike() {

        const fanartId = data?.id

        if (typeof fanartId !== "number")
            return await interaction.reply({
                content: `${e.Deny} | Não foi possível contabilizar o like.`,
                ephemeral: true
            })

        await Database.Fanart.findOneAndUpdate(
            { id: fanartId },
            {
                $addToSet: { [data.src]: interactionUser.id },
                $pull: { [data.src === "unlike" ? "like" : "unlike"]: interactionUser.id }
            },
            { new: true }
        )
            .then(async document => {

                const components = message.components

                if (!components[0])
                    return await interaction.update({
                        content: "${e.Deny} | ${EncoderFormatReponseComponents}",
                        embeds: [],
                        components: []
                    })

                const buttons = components[0]?.toJSON()
                buttons.components[0].label = document.like?.length || 0
                buttons.components[1].label = document.unlike?.length || 0

                return await interaction.update({ components: [buttons] }).catch(() => { })
            })
            .catch(async error => {
                return await interaction.update({
                    content: `${e.Deny} | Erro ao computar o like.\n${e.Bug} | \`${error}\``,
                    components: [],
                    embeds: []
                })
            })
    }

}