import {
    SaphireClient as client,
    Discloud
} from '../../../../../classes/index.js'
import { Emojis as e } from '../../../../../util/util.js'

export default async interaction => {

    await interaction.deferReply({ ephemeral: true })

    const response = await Discloud.apps.backup('saphire')

    if (!response)
        return await interaction.editReply({
            content: `${e.Deny} | Não foi possível concluir do backup.`
        })

    return await interaction.editReply({
        embeds: [{
            color: client.blue,
            title: `${e.Check} Discloud Backup`,
            description: `[Backup](${response.url}) gerado com sucesso.`
        }]
    }).catch(console.log)



}