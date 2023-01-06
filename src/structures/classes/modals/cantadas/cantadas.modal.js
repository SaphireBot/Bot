import {
    Database,
    SaphireClient as client
} from "../../../../classes/index.js"
import { CodeGenerator } from '../../../../functions/plugins/plugins.js'
import { Emojis as e } from "../../../../util/util.js"

export default async ({ interaction, user, guild, fields }) => {

    const cantada = fields.getTextInputValue('cantada') || null
    const cantadaId = CodeGenerator(10)

    await Database.Client.updateOne(
        { id: client.user.id },
        {
            $push: {
                CantadasIndicadas: {
                    userId: user.id,
                    cantada,
                    cantadaId
                }
            }
        }
    )

    return await interaction.reply({
        content: `${e.Check} | Sua cantada foi envida com sucesso e está aguardando a aprovação de um dos membros da Saphire's Team.`,
        ephemeral: true
    })

}