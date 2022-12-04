import mercadopago from "mercadopago"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, commandData) => {

    const { id } = commandData

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