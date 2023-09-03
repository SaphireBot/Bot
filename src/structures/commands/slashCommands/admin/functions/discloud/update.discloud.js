import { Discloud } from '../../../../../../classes/index.js'
import { Emojis as e } from '../../../../../../util/util.js'

export default async interaction => {

    await interaction.deferReply({})

    const response = await Discloud.apps.update('saphire', { file: './src.zip' })
        .catch(err => {
            console.log(err)
            return false
        })

    if (!response)
        return interaction.editReply({ content: `${e.Deny} | Não foi possivel realizar o commit.` }).catch(() => { })

    return interaction.editReply({ content: `${e.Check} | Commit realizado com sucesso.` }).catch(() => { })
}