import { SaphireClient as client, Discloud } from '../../../../../../classes/index.js'
import { Emojis as e } from '../../../../../../util/util.js'

export default async interaction => {

    await interaction.deferReply({})

    const response = await Discloud.apps.terminal('saphire').catch(() => null)

    if (!response)
        return await interaction.editReply({
            content: `${e.Deny} | Não foi possível acessar o terminal.`
        })

    if (!response.small || !response.small.length)
        return await interaction.editReply({
            content: `${e.Deny} | O logs da aplicação está vázio.`
        })

    return await interaction.editReply({
        embeds: [{
            color: client.blue,
            title: `${e.Reference} Discloud Logs`,
            url: response.url,
            description: `\`\`\`txt\n${response.small}\`\`\``.limit('MessageEmbedDescription')
        }]
    }).catch(() => { })

}