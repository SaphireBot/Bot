import { ButtonStyle } from "discord.js"
import {
    SaphireClient as client,
    Database
} from "../../../../../../classes/index.js"
import { Emojis as e } from "../../../../../../util/util.js"

export default async (interaction, optionValue) => {

    const question = await Database.Rather.findOne({ id: optionValue })

    if (!question)
        return await interaction.reply({
            content: `${e.Deny} | Questão não encontrada`,
            ephemeral: true
        })

    const { user } = interaction
    const msg = await interaction.reply({
        content: `${e.QuestionMark} | Você tem certeza que deseja deletar a questão \`${optionValue}\`?`,
        embeds: [{
            color: client.blue,
            title: `${e.Trash} Deletar question`,
            description: `Question ID: \`${optionValue}\`\nUsuários que responderam: \`${question.optionOne.users.length + question.optionTwo.users.length}\``,
            fields: [
                {
                    name: '🔵 Opção 1',
                    value: question.optionOne.question
                },
                {
                    name: '🟢 Opção 2',
                    value: question.optionTwo.question
                },
                {
                    name: '👤 Autor',
                    value: `${client.users.resolve(question.authorId)?.tag || 'Not Found'} - \`${question.authorId}\``
                }
            ],
            footer: { text: question.edited ? 'Resposta original editada' : null }
        }],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Deletar',
                        emoji: e.Trash,
                        custom_id: 'delete',
                        style: ButtonStyle.Danger
                    },
                    {
                        type: 2,
                        label: 'Cancelar',
                        emoji: e.Deny,
                        custom_id: 'cancel',
                        style: ButtonStyle.Success
                    }
                ]
            }
        ]
    })

    const collector = msg.createMessageComponentCollector({
        filter: int => int.user.id === user.id,
        time: 30000,
        errors: ['time']
    })
        .on('collect', async int => {

            const { customId } = int

            if (customId === 'cancel') return collector.stop()

            await Database.Rather.deleteOne({ id: optionValue })

            await int.message.delete().catch(() => { })
            return await interaction.followUp({
                content: `${e.Check} | A questão \`${optionValue}\` foi deletada com sucesso.`,
                embeds: [],
                components: [],
                ephemeral: true
            }).catch(() => { })
        })
        .on('end', async (_, reason) => {

            if (['time', 'user'].includes(reason))
                return await interaction.editReply({
                    content: `${e.Deny} | Comando cancelado.`,
                    embeds: [],
                    components: []
                }).catch(() => { })

        })
}