export default async ({ interaction, client, e, Database, embed }) => {

    if (!embed)
        return await interaction.update({
            content: `${e.Deny} | Embed não encontrada.`,
            components: []
        })

    const questionId = embed.footer.text
    const questionOne = embed.fields[3]?.value || embed.fields[0].value
    const questionTwo = embed.fields[4]?.value || embed.fields[1].value

    return Database.Rather.findOneAndUpdate(
        { id: questionId },
        {
            $set: {
                ['optionOne.question']: questionOne,
                ['optionTwo.question']: questionTwo,
                edited: true
            }
        }, { new: true }
    )
        .then(async question => {
            await interaction.message.delete().catch(() => { })
            return await interaction.reply({
                embeds: [{
                    color: client.green,
                    title: '✍ Questão editada com sucesso',
                    description: `Question ID: \`${question.id}\`\nQuestão respondida \`${question.optionOne.users.length || 0 + question.optionTwo.users.length || 0}\` vezes`,
                    fields: [
                        {
                            name: '🔵 Opção 1',
                            value: `~~${embed.fields[0].value}~~`
                        },
                        {
                            name: '🟢 Opção 2',
                            value: `~~${embed.fields[1].value}~~`
                        },
                        {
                            name: '👤 Autor',
                            value: `${client.users.resolve(question.authorId)?.username || 'Not Found'} - \`${question.authorId}\``
                        },
                        {
                            name: `🔵 Opção 1 - ${e.Check}`,
                            value: question.optionOne.question
                        },
                        {
                            name: `🟢 Opção 2 - ${e.Check}`,
                            value: question.optionTwo.question
                        }
                    ],
                    footer: { text: `${question.id} - Editado` }
                }],
                ephemeral: true
            }).catch(() => { })
        })
        .catch(async () => {
            return await interaction.update({
                content: `${e.Deny} | Não foi possível editar está questão.`,
                embeds: [],
                components: []
            }).catch(() => { })
        })

}