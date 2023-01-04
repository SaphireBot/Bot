import {
    Database,
    SaphireClient as client
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, user, commandData, message) => {

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