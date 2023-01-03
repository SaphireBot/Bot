import { ButtonStyle } from "discord.js"
import { Database, SaphireClient as client } from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"

export default async (interaction, cantadaId, cantadas = null) => {

    if (!client.staff.includes(interaction.user.id))
        return await interaction.reply({
            content: `${e.Deny} | Apenas membros da Saphire's Team tem poder de analize neste sistema.`,
            ephemeral: true
        })

    const cId = cantadaId || cantadas.random()?.cantadaId

    if (!cId)
        return await interaction.reply({
            content: `${e.Deny} | Não foi possível obter o ID cantada.`,
            ephemeral: true
        })

    const clientData = cantadas || await Database.Client.findOne({ id: client.user.id }, 'CantadasIndicadas')
    const indications = cantadas || clientData.CantadasIndicadas || []

    if (!indications || !indications.length)
        return await interaction.reply({
            content: `${e.Deny} | Não existe nenhuma sugestão de cantada.`,
            ephemeral: true
        })

    const cantada = indications.find(c => c.cantadaId === cId)

    if (!cantada)
        return await interaction.reply({
            content: `${e.Deny} | Cantada não encontrada.`,
            ephemeral: true
        })

    const author = await client.users.fetch(cantada.userId || '0')
        .then(u => `${u.tag} - \`${u.id}\``)
        .catch(() => null) || `Not Found \`${cantada.userId}\``

    const replyData = {
        embeds: [{
            color: client.blue,
            title: '😗 Sugestão de Cantada',
            fields: [
                {
                    name: '📝 Cantada',
                    value: `${cantada.cantada || 'Not Found'}`
                },
                {
                    name: '📨 Enviada por',
                    value: author
                }
            ],
            footer: {
                text: `${cantada.cantadaId || "0"}`
            }
        }],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Aceitar',
                        custom_id: JSON.stringify({ c: 'cantada', src: 'accept', cId, userId: cantada.userId }),
                        style: ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: 'Recusar',
                        custom_id: JSON.stringify({ c: 'cantada', src: 'deny', cId, userId: cantada.userId }),
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ]
    }

    if (cantadaId) {
        await interaction.update({ components: [] }).catch(() => { })
        return await interaction.followUp(replyData)
    }

    return await interaction.reply(replyData)

}