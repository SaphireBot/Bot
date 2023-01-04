import { ButtonStyle } from "discord.js"
import {
    SaphireClient as client,
    Database
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (cantadaId, interaction) => {

    const clientData = await Database.Client.findOneAndUpdate(
        { id: client.user.id },
        { $pull: { 'CantadasIndicadas': { cantadaId } } },
        { upsert: true, new: true, fields: 'CantadasIndicadas' }
    )
    const remains = clientData.CantadasIndicadas || []

    if (!remains.length)
        return await interaction.editReply({
            content: `${e.Deny} | Não existe mais nenhuma cantada para análise.`,
            components: []
        }).catch(() => { })

    return await interaction.editReply({
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Avaliar próxima cantada',
                        custom_id: JSON.stringify({ c: 'cantada', src: 'next', cId: remains?.random()?.cantadaId || null }),
                        style: ButtonStyle.Primary
                    }
                ]
            }
        ]
    })
}