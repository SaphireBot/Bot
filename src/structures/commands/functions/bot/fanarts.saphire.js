import { ButtonStyle } from "discord.js"
import {
    Database,
    SaphireClient as client
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, data) => {

    const fanartsData = await Database.Fanart.find({}) || []

    if (!fanartsData || !fanartsData?.length)
        return await interaction.reply({
            content: `${e.Deny} | Nenhuma fanarts foi registrada no banco de dados.`,
            ephemeral: true
        })

    const index = 0
    const fanart = fanartsData[index]
    const user = await client.users.fetch(fanart?.userId).catch(() => null)

    return await interaction.reply({
        embeds: [{
            color: client.blue,
            title: "🖌 Fanarts - Saphire",
            description: `Essa fanart foi feita por **${user?.tag || "`Not Found`"}** - \`${fanart?.userId || 0}\``,
            fields: [
                {
                    name: "🏷️ Imagem",
                    value: `\`${fanart?.id || 0}\` - ${fanart?.name || 'Name Not Found'}`
                }
            ],
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
                        label: `${fanart?.like || 0}`,
                        emoji: e.Upvote,
                        custom_id: 'like',
                        style: ButtonStyle.Success,
                        disabled: true
                    },
                    {
                        type: 2,
                        label: `${fanart?.unlike || 0}`,
                        emoji: e.DownVote,
                        custom_id: 'unlike',
                        style: ButtonStyle.Danger,
                        disabled: true
                    },
                    {
                        type: 2,
                        emoji: '⬅',
                        custom_id: JSON.stringify({ c: 'fanart', src: "left", index: index <= 0 ? 0 : index - 1 }),
                        style: ButtonStyle.Primary,
                        disabled: true
                    },
                    {
                        type: 2,
                        emoji: '➡',
                        custom_id: JSON.stringify({ c: 'fanart', src: "right", index: index >= fanartsData?.length ? 0 : index + 1 }),
                        style: ButtonStyle.Primary,
                        disabled: true
                    }
                ]
            }
        ]
    })

}