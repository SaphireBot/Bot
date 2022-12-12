import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, commandData) => {

    const { id, src } = commandData

    if (src === 'nubank')
        return await interaction.reply({
            content: '00020126620014BR.GOV.BCB.PIX0114+55119819899640222Saphire Project Donate5204000053039865802BR5920Rodrigo Couto Santos6009SAO PAULO61080540900062180514SaphireProject6304E10B',
            ephemeral: true
        })

}