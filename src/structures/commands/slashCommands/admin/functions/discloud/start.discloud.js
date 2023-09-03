import { Discloud } from '../../../../../../classes/index.js'
import { Emojis as e } from '../../../../../../util/util.js'

export default async interaction => {

    await interaction.reply({
        content: `${e.Loading} | Solicitando start do client a Discloud Host...`,
        fetchReply: true
    })

    const response = await Discloud.apps.start('saphire')

    if (!response)
        return await interaction.editReply({
            content: `${e.Deny} | Não foi possível concluir o start.`
        })

    return await interaction.editReply({
        content: `${e.Check} | Inicialização solicitada com sucesso.`,
    }).catch(() => { })
}