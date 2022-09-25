import {
    SaphireClient as client,
    Database
} from '../../../../../classes/index.js'
import { formatString } from '../../../../../functions/plugins/plugins.js'
import { ButtonStyle } from 'discord.js'
import { Emojis as e } from '../../../../../util/util.js'
import fs from 'fs'

export default async interaction => {

    const { options, user } = interaction
    const logoData = Database.Logomarca || []
    const logoChoice = options.getString('select_logo_marca')
    const logoIndex = logoData.findIndex(data => data.answers[0].toLowerCase() === logoChoice.toLowerCase())
    const logo = logoData[logoIndex]

    if (!logo)
        return await interaction.reply({
            content: `${e.Deny} | Nenhuma logo/marca foi encontrada`,
            ephemeral: true
        })

    const buttons = {
        type: 1,
        components: [
            {
                type: 2,
                label: 'EXCLUIR LOGO/MARCA',
                custom_id: 'delete',
                style: ButtonStyle.Success
            },
            {
                type: 2,
                label: 'CANCELAR EXCLUSÃO',
                custom_id: 'cancel',
                style: ButtonStyle.Danger
            }
        ]
    }

    const embeds = [{
        color: client.blue,
        title: `${e.Database} Remove Logo/Marca`,
        description: `Nomes: ${logo.answers.map(x => `\`${formatString(x)}\``).join(', ')}`,
        image: { url: logo.images.uncensored || null }
    }]

    if (logo.images.censored)
        embeds.push({
            color: client.blue,
            title: 'Imagem censurada',
            image: { url: logo.images.censored || null }
        })

    const msg = await interaction.reply({
        embeds: embeds,
        components: [buttons],
        ephemeral: true,
        fetchReply: true
    })

    return msg.createMessageComponentCollector({
        filter: int => int.user.id === user.id,
        time: 30000,
        max: 1,
        errors: ['max', 'time']
    })
        .on('collect', async int => {

            const { customId } = int

            if (customId === 'cancel') return

            logoData.splice(logoIndex, 1)

            fs.writeFile(
                './JSON/logomarca.json',
                JSON.stringify(logoData, null, 4),
                async function (err) {
                    if (err)
                        return await interaction.reply({
                            content: `${e.Deny} | Não foi possível deletar esta logomarca.`,
                            ephemeral: true
                        })

                    return await interaction.editReply({
                        content: `${e.Check} | A marca ${formatString(logo.answers[0])} foi removida com sucesso.`,
                        embeds: [],
                        components: []
                    })
                }
            )


        })
        .on('end', async (_, r) => {
            if (r !== 'time') return
            return await interaction.editReply({
                content: `${e.Deny} | Comando cancelado.`,
                embeds: [],
                components: []
            })
        })

}