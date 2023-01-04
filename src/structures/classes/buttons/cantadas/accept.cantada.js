import {
    Database,
    SaphireClient as client
} from "../../../../classes/index.js"
import deny from './deny.cantada.js'
import pull from './pull.cantada.js'

export default async (cantadaId, prhase, commandData, user, interaction, embed) => {

    if (client.cantadas.find(c => c.id === cantadaId || c.phrase == prhase))
        return deny(true)

    new Database.Cantadas({
        id: cantadaId,
        phrase: prhase,
        acceptedFor: user.id,
        userId: commandData.userId
    }).save()

    client.cantadas.push({
        id: cantadaId,
        phrase: prhase,
        acceptedFor: user.id,
        userId: commandData.userId
    })

    embed.color = client.green
    embed.fields.push({
        name: 'Cantada aceita',
        value: 'Esta cantada foi aceita e validada no banco de dados'
    })

    await interaction.update({
        embeds: [embed],
        components: []
    }).catch(() => { })

    return pull(cantadaId, interaction)
}