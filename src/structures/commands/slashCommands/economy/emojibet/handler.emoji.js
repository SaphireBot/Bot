import { ButtonStyle } from "discord.js"
import { SaphireClient as client } from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"

export default async interaction => {

    const emojis = Object.entries(e || {})
    const embeds = EmbedGenerator(emojis)

    if (!embeds || !embeds.length)
        return await interaction.reply({
            content: `${e.Deny} | Não foi possível formular a embed de visualização dos emojis.`,
            ephemeral: true
        })

    if (embeds.length === 1)
        return await interaction.reply({ embeds: [embeds[0]] })

    const message = await interaction.reply({
        embeds: [embeds[0]],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: '⏮️',
                        custom_id: 'first',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: '⬅️',
                        custom_id: 'left',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: '➡️',
                        custom_id: 'right',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: '⏭️',
                        custom_id: 'last',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: '✖️',
                        custom_id: 'cancel',
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ],
        fetchReply: true
    })
    let index = 0

    const collector = message.createMessageComponentCollector({
        filter: int => int.user.id === interaction.user.id,
        idle: 60000,
        errors: ['idle']
    })
        .on('collect', async int => {

            const { customId } = int

            if (customId === 'cancel')
                return collector.stop()

            if (customId === 'first')
                index = 0

            if (customId === 'left') {
                index--
                if (!embeds[index]) index = embeds.length - 1
            }

            if (customId === 'right') {
                index++
                if (!embeds[index]) index = 0
            }

            if (customId === 'last')
                index = embeds.length - 1

            return await int.update({ embeds: [embeds[index]] }).catch(() => { })
        })
        .on('end', async () => await interaction.editReply({ components: [] }).catch(() => { }))

    function EmbedGenerator(array) {

        let amount = 10
        let page = 1
        const embeds = []
        const length = array.length / 10 <= 1 ? 1 : parseInt((array.length / 10) + 1)

        for (let i = 0; i < array.length; i += 10) {

            const description = array
                .slice(i, amount)
                .map(emoji => `${emoji[1]} - \`${emoji[0]}\` \`${emoji[1]}\``)
                .join('\n')

            const pageCount = length > 1 ? ` - ${page}/${length}` : ''

            embeds.push({
                color: client.blue,
                title: `😁 Saphire Emojis Handler${pageCount}`,
                description,
                footer: {
                    text: `${array.length} emojis disponíveis`
                }
            })

            page++
            amount += 10

        }

        return embeds
    }

}