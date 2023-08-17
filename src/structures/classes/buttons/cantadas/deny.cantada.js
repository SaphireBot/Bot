import { SaphireClient as client } from '../../../../classes/index.js'
import pull from './pull.cantada.js'

export default async (embed, exist, interaction, cantadaId) => {

    embed.color = client.red
    embed.fields.push({
        name: 'Cantada recusada',
        value: exist
            ? 'Esta cantada já existe no banco de dados'
            : 'Esta cantada foi recusada e retirada do banco de dados'
    })

    await interaction.update({ embeds: [embed], components: [] }).catch(() => { })
    return pull(cantadaId, interaction)
}