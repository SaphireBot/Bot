import {
    Database,
    SaphireClient as client
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, user, cantadaId, message, invalid) => {

    if (!invalid && !client.staff.includes(user?.id))
        return await interaction.reply({
            content: `${e.Deny} | Apenas membros da Staff podem deletar uma cantada.`,
            ephemeral: true
        })

    return Database.Cantadas.deleteOne({ id: cantadaId })
        .then(async result => {

            if (invalid) client.setCantadas()

            if (!message)
                return await interaction.reply({
                    content: `${e.Check} | Cantada deletada por não ser válida.`
                })

            const { embeds } = message
            const embed = embeds[0]?.data

            if (invalid) {
                embed.color = client.red
                embed.description = embed.description || 'Cantada sem conteúdo'
                embed.title = 'Saphire\'s Cantadas Manager'
                embed.fields = [{
                    name: 'Feedback',
                    value: `${e.Deny} | A cantada \`${cantadaId}\` não é válida. Cantada deletada com sucesso.`
                }]

                message.components[0].components.splice(0, 2)
                return await interaction.update({ embeds: [embed], components: message.components })
            }

            if (result.deletedCount === 0) {

                embed.color = client.red
                embed.fields.push({
                    name: 'Feedback',
                    value: `${e.Deny} | Nenhuma cantada com o ID \`${cantadaId}\` não está no banco de dados.`
                })

                return await interaction.update({ embeds: [embed], components: [] }).catch(() => { })
            }

            if (result.deletedCount === 1) {

                embed.color = client.green
                embed.fields.push({
                    name: 'Feedback',
                    value: `${e.Check} | A cantada com o ID \`${cantadaId}\` foi deletada com sucesso.`
                })

                client.cantadas.splice(
                    client.cantadas.findIndex(c => c.id === cantadaId),
                    1
                )

                return await interaction.update({ embeds: [embed], components: [] }).catch(() => { })
            }

            embed.fields.push({
                name: 'Feedback',
                value: `${e.Check} | A cantada com o ID \`${cantadaId}\` não teve uma resposta esperada ao efetuar a exclusão, tente novamente.`
            })

            return await interaction.update({ embeds: [embed], components: [] }).catch(() => { })
        })
        .catch(async err => await interaction.update({
            content: `${e.Deny} | Não foi possível deletar a cantada \`${cantadaId}\`.\n${e.bug} | \`${err}\``
        }).catch(() => { }))

}