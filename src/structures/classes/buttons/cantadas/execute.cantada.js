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

    if (method === 'delete')
        return deleteCantada()

    if (['like', 'unlike'].includes(method))
        return likeCantada({ interaction, message, method, commandData })

    if (method === 'random') {
        if (interaction?.message?.interaction?.user?.id !== user.id) return
        return viewCantadas({ interaction, buttonInteraction: true, commandData })
    }

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

        if (client.cantadas.find(c => c.id === cantadaId))
            return deny(true)

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

    async function deny(exist) {
        embed.color = client.red
        embed.fields.push({
            name: 'Cantada recusada',
            value: exist
                ? 'Esta cantada já existe no banco de dados'
                : 'Esta cantada foi recusada e retirada do banco de dados'
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

    async function deleteCantada() {

        if (!client.staff.includes(user.id))
            return await interaction.reply({
                content: `${e.Deny} | Apenas membros da Staff podem deletar uma cantada.`,
                ephemeral: true
            })

        return Database.Cantadas.deleteOne({ id: commandData.cantadaId })
            .then(async result => {

                const { embeds } = message
                const embed = embeds[0]?.data

                if (result.deletedCount === 0) {

                    embed.color = client.red
                    embed.fields.push({
                        name: 'Feedback',
                        value: `${e.Deny} | Nenhuma cantada com o ID \`${commandData.cantadaId}\` não está no banco de dados.`
                    })

                    return await interaction.update({ embeds: [embed], components: [] }).catch(() => { })
                }

                if (result.deletedCount === 1) {

                    embed.color = client.green
                    embed.fields.push({
                        name: 'Feedback',
                        value: `${e.Check} | A cantada com o ID \`${commandData.cantadaId}\` foi deletada com sucesso.`
                    })

                    client.cantadas.splice(
                        client.cantadas.findIndex(c => c.id === commandData.cantadaId),
                        1
                    )

                    return await interaction.update({ embeds: [embed], components: [] }).catch(() => { })
                }

                embed.fields.push({
                    name: 'Feedback',
                    value: `${e.Check} | A cantada com o ID \`${commandData.cantadaId}\` não teve uma resposta esperada ao efetuar a exclusão, tente novamente.`
                })

                return await interaction.update({ embeds: [embed], components: [] }).catch(() => { })
            })
            .catch(async err => await interaction.update({
                content: `${e.Deny} | Não foi possível deletar a cantada \`${commandData.cantadaId}\`.\n${e.bug} | \`${err}\``
            }).catch(() => { }))

    }
}