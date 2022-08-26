import {
    SaphireClient as client,
    Discloud
} from '../../../../../classes/index.js'
import { Emojis as e } from '../../../../../util/util.js'
import('dotenv/config')

export default async interaction => {

    await interaction.deferReply({})

    const response = Discloud.user

    if (!response)
        return await interaction.editReply({
            content: `${e.Deny} | Não foi possível obter as informações do usuário.`
        })

    console.log(response)
    return await interaction.editReply({
        embeds: [{
            color: client.blue,
            title: `${e.Check} Discloud Backup`,
            description: `[Backup](${response.backups.url}) gerado com sucesso.`
        }]
    }).catch(console.log)


}