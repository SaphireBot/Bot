import { ButtonStyle } from 'discord.js'
import {
    SaphireClient as client,
    Database
} from '../../../../classes/index.js'
import { formatString } from '../../../../functions/plugins/plugins.js'
import { Emojis as e } from '../../../../util/util.js'

export default async interaction => {

    const { options, user } = interaction
    const letters = options.getString('filter') || null
    const logoData = Database.Logomarca || []
    const fill = logoData.sort(function (x, y) {
        let a = x.answers[0].toUpperCase()
        let b = y.answers[0].toUpperCase()
        return a == b ? 0 : a > b ? 1 : -1
    }).filter(logo => logo.answers[0].startsWith(letters ?? logo.answers[0]))

    if (fill.length === 0)
        return await interaction.reply({
            content: `${e.Deny} | Nenhuma logo/marca foi encontrada.`,
            ephemeral: true
        })

    const embeds = EmbedGenerator(fill)

    if (embeds.length <= 1)
        return await interaction.reply({ embeds: [embeds[0]] })

    let index = 0
    const buttons = [{
        type: 1,
        components: [
            {
                type: 2,
                emoji: e.saphireLeft,
                custom_id: 'left',
                style: ButtonStyle.Primary
            },
            {
                type: 2,
                emoji: e.saphireRight,
                custom_id: 'right',
                style: ButtonStyle.Primary
            },
            {
                type: 2,
                label: 'Cancelar',
                custom_id: 'cancel',
                style: ButtonStyle.Danger
            }
        ]
    }]

    const msg = await interaction.reply({
        embeds: [embeds[0]],
        components: buttons,
        fetchReply: true
    })

    const collector = msg.createMessageComponentCollector({
        filter: int => int.user.id === user.id,
        idle: 30000,
        errors: ['idle']
    })
        .on('collect', async int => {

            const { customId } = int

            if (customId === 'cancel') return collector.stop()

            if (customId === 'left') {
                index--
                if (index < 0) index = embeds.length - 1
            }

            if (customId === 'right') {
                index++
                if (index > embeds.length - 1) index = 0
            }

            return await int.update({ embeds: [embeds[index]] }).catch(() => { })

        })
        .on('end', async () => {

            const embed = msg.embeds[0]?.data

            if (!embed)
                return await interaction.deleteReply().catch(() => { })

            embed.color = client.red
            return await interaction.editReply({ embeds: [embed], components: [] }).catch(() => { })
        })

    function EmbedGenerator(array) {

        let amount = 7
        let page = 1
        const embeds = []
        const length = array.length / 7 <= 1 ? 1 : parseInt((array.length / 7))

        for (let i = 0; i < array.length; i += 7) {

            const current = array.slice(i, amount)
            const fields = []

            current.map((data) => fields.push({
                name: `${formatString(data.answers[0])}`,
                value: data.answers.slice(1).map(x => `> \`${formatString(x)}\``).join('\n') || '> `Nenhum Sinônimo`'
            }))

            const pageCount = length > 1 ? ` ${page}/${length}` : ''

            embeds.push({
                color: client.blue,
                title: `🖼 Logo List View${pageCount}`,
                description: 'As logomarcas estão organizadas em ordem alfabética.',
                fields: fields
            })

            page++
            amount += 7

        }

        return embeds
    }

}