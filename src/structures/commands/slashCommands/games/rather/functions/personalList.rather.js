import { ButtonStyle } from "discord.js"
import {
    SaphireClient as client,
    Database
} from "../../../../../../classes/index.js"
import { Emojis as e } from "../../../../../../util/util.js"

export default async interaction => {

    const { user } = interaction
    const allData = await Database.Rather.find({ authorId: user.id }) || []

    if (!allData || !allData.length)
        return await interaction.reply({
            content: `${e.Deny} | Nenhuma questão foi encontrada.`,
            ephemeral: true
        })

    const embeds = EmbedGenerator(allData)

    if (embeds.length <= 1)
        return await interaction.reply({ embeds: embeds[0] })

    const buttons = [{
        type: 1,
        components: [
            {
                type: 2,
                label: 'Pra cá',
                emoji: e.saphireLeft,
                custom_id: 'left',
                style: ButtonStyle.Primary
            },
            {
                type: 2,
                label: `1/${embeds.length} - ${allData.length}`,
                custom_id: '0',
                style: ButtonStyle.Secondary,
                disabled: true
            },
            {
                type: 2,
                label: 'Pra lá',
                emoji: e.saphireRight,
                custom_id: 'right',
                style: ButtonStyle.Primary
            }
        ]
    }]

    const msg = await interaction.reply({
        embeds: embeds[0],
        components: buttons,
        fetchReply: true
    })

    let index = 0

    return msg.createMessageComponentCollector({
        filter: int => int.user.id === user.id,
        idle: 60000
    })
        .on('collect', async ButtonInteraction => {

            const { customId } = ButtonInteraction

            if (customId === 'right') {
                index++
                if (!embeds[index]) index = 0
            }

            if (customId === 'left') {
                index--
                if (!embeds[index]) index = embeds.length - 1
            }

            buttons[0].components[1].label = `${index + 1}/${embeds.length} - ${allData.length}`
            return await ButtonInteraction.update({ embeds: embeds[index], components: buttons }).catch(() => { })
        })
        .on('end', async () => {

            const embedsData = embeds[index]

            for (let embed of embedsData) {
                embed.color = client.red
                embed.footer = { text: 'Tempo esgotado.' }
            }

            return await interaction.editReply({
                embeds: embedsData,
                components: []
            }).catch(() => { })

        })

    function EmbedGenerator(array) {

        let amount = 5
        const embeds = []

        for (let i = 0; i < array.length; i += 5) {

            const current = array.slice(i, amount)
            let embedsData = []

            for (let data of current) {

                const optionOneLength = data.optionOne.users.length || 0
                const optionTwoLength = data.optionTwo.users.length || 0
                const total = optionOneLength + optionTwoLength
                const optionOnePercent = total > 0 ? parseInt((optionOneLength / total) * 100)?.toFixed(1) || 0 : 0
                const optionTwoPercent = total > 0 ? parseInt((optionTwoLength / total) * 100)?.toFixed(1) || 0 : 0
                const edited = data.edited ? 'Questão editada' : 'Questão não editada'

                embedsData.push({
                    color: client.blue,
                    title: '🔍 Question View',
                    description: `${total} pessoas responderam esta questão`,
                    fields: [
                        {
                            name: `🔵 Opção 1 - ${optionOnePercent}%`,
                            value: data.optionOne.question
                        },
                        {
                            name: `🟢 Opção 2 - ${optionTwoPercent}%`,
                            value: data.optionTwo.question
                        }
                    ],
                    footer: { text: `ID: ${data.id} - ${edited}` }
                })

            }

            if (embedsData.length > 0)
                embeds.push(embedsData)

            embedsData = []
            amount += 5
            continue
        }

        return embeds
    }

}