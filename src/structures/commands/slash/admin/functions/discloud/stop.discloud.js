import { Discloud } from '../../../../../../classes/index.js'
import { Emojis as e } from '../../../../../../util/util.js'

export default async interaction => {

    await interaction.reply({
        content: `${e.Loading} | Solicitando desligamento do client na Discloud Host...`,
        fetchReply: true
    })

    const response = await Discloud.apps.stop('saphire')

    if (!response)
        return await interaction.editReply({
            content: `${e.Deny} | Não foi possível desligar o cliente.`
        })

    return await interaction.editReply({
        content: `${e.Check} | App parado com sucesso.`,
    }).catch()

}