import { ButtonStyle } from 'discord.js'
import {
    SaphireClient as client,
    Database
} from '../../../../classes/index.js'
import { formatString } from '../../../../functions/plugins/plugins.js'
import { Emojis as e } from '../../../../util/util.js'

export default async interaction => {

    const { options, user } = interaction
    const logoData = Database.Logomarca || []
    const selectLogo = options.getString('select_logo_marca')
    const logo = logoData.find(data => data.answers[0] === selectLogo)

    if (!logo)
        return await interaction.reply({
            content: `${e.Deny} | Nenhuma logo/marca foi encontrada`,
            ephemeral: true
        })

    const embeds = [{
        color: client.blue,
        title: `🖼 Showing View Logo/Marca`,
        description: `Nome e Sinônimos: ${logo.answers.map(x => `\`${formatString(x)}\``).join(', ')}`,
        image: { url: logo.images.uncensored },
        footer: { text: 'Se a imagem não aparecer, o link está corrompido.' }
    }]

    const buttons = [{
        type: 1,
        components: [{
            type: 2,
            label: 'VER IMAGEM CENSURADA',
            custom_id: 'trade',
            style: ButtonStyle.Primary
        }]
    }]

    const msg = await interaction.reply({
        embeds: embeds,
        components: logo.images.censored ? buttons : null,
        fetchReply: true
    })

    if (!logo.images.censored) return

    const collector = msg.createMessageComponentCollector({
        filter: int => int.user.id === user.id,
        idle: 30000
    })
        .on('collect', async int => {

            const embed = msg.embeds[0]?.data
            if (!embed) return collector.stop()

            const url = logo.images.censored === embed.image.url ? logo.images.uncensored : logo.images.censored
            buttons[0].components[0].label = buttons[0].components[0].label === 'VER IMAGEM CENSURADA' ? 'VER IMAGEM SEM CENSURADA' : 'VER IMAGEM CENSURADA'
            embed.image = { url: url || null }

            return await int.update({ embeds: [embed], components: buttons }).catch(() => { })
        })
        .on('end', async () => await interaction.editReply({ components: [] }).catch(() => { }))

    return

}