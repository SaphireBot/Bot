import { ButtonStyle } from "discord.js"
import {
    SaphireClient as client,
    Database
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import viewCantadas from "../../../commands/functions/cantadas/view.cantadas.js"
import cantadaAdmin from "../../../commands/slashCommands/admin/admin/cantada.admin.js"
import likeCantada from "./like.cantada.js"

export default async ({ interaction, user, message }, commandData) => {

    const method = commandData.src
    if (['like', 'unlike'].includes(method))
        return likeCantada({ interaction, message, method, commandData })

    if (method === 'random' && commandData.userId === user.id)
        return viewCantadas({ interaction, buttonInteraction: true, commandData })

    if (!client.staff.includes(user.id))
        return await interaction.reply({
            content: `${e.Deny} | Apenas os membros da Staff tem permissão para aceitar/recusar cantandas.`,
            ephemeral: true
        })

    const cantadaId = commandData.cId
    const { embeds } = message
    const embed = embeds[0]?.data

    if (method === 'next') {
        await cantadaAdmin(interaction, cantadaId)
        return await interaction.update({ components: [] })
            .catch(async () => await interaction.editReply({ components: [] }).catch(() => { }))
    }

    if (!embed)
        return await interaction.update({
            content: `${e.Deny} | Embed não encontrada`,
            embeds: [],
            components: []
        }).catch(() => { })

    const cantada = embed.fields[0].value
    if (!cantada)
        return await interaction.update({
            content: `${e.Deny} | Conteúdo da cantada não identificado`,
            embeds: [],
            components: []
        }).catch(() => { })

    return method === 'accept' ? accept() : deny()

    async function accept() {

        new Database.Cantadas({
            id: cantadaId,
            phrase: cantada,
            acceptedFor: user.id,
            userId: commandData.userId
        }).save()

        client.cantadas.push({
            id: cantadaId,
            phrase: cantada,
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

        return pull()
    }

    async function deny() {
        embed.color = client.red
        embed.fields.push({
            name: 'Cantada recusada',
            value: 'Esta cantada foi recusada e retirada do banco de dados'
        })

        await interaction.update({
            embeds: [embed],
            components: []
        }).catch(() => { })
        return pull()
    }

    async function pull() {
        const clientData = await Database.Client.findOneAndUpdate(
            { id: client.user.id },
            {
                $pull: {
                    'CantadasIndicadas': { cantadaId }
                }
            },
            {
                upsert: true,
                new: true,
                fields: 'CantadasIndicadas'
            }
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
}