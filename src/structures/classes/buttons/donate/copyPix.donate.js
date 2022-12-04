import mercadopago from "mercadopago"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, commandData) => {

    const { id, src } = commandData

    if (src === 'nubank')
        return await interaction.reply({
            content: '00020126620014BR.GOV.BCB.PIX0114+55119819899640222Saphire Project Donate5204000053039865802BR5920Rodrigo Couto Santos6009SAO PAULO61080540900062180514SaphireProject6304E10B',
            ephemeral: true
        })

    const payment = await mercadopago.payment.get(id)
        .then(data => data.body)
        .catch(() => null)

    if (!payment)
        return await interaction.update({
            content: `${e.Deny} | Pagamento não encontrado.`,
            embeds: [],
            components: [],
            files: []
        })

    const copyAndPaste = payment?.point_of_interaction?.transaction_data?.qr_code

    if (!copyAndPaste)
        return await interaction.reply({
            content: `${e.Deny} | Não foi possível obter o código copia e cola deste pagamento.`
        })

    return await interaction.reply({
        content: `${copyAndPaste}`,
        ephemeral: true
    })
}