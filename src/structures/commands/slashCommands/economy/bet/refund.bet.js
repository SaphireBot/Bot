import { Database, SaphireClient as client } from '../../../../../classes/index.js'

export default async ({ interaction, e }) => {

    const { options, user, guild } = interaction
    const messageId = options.getString('available_bets')
    if (messageId === 'all') return refundAll()

    const cachedData = await Database.Cache.Bet.get(messageId)

    if (!cachedData)
        return await interaction.reply({
            content: `${e.Deny} | Dados da aposta não encontrado.`,
            ephemeral: true
        })

    client.emit('betRefund', cachedData)
    return await interaction.reply({
        content: `${e.Check} | A aposta foi resgatada e todos os participantes receberam seu dinheiro novamente.\n${e.Info} | A aposta não está mais disponível, qualquer reação irá desativa-la.\n> Aposta \`${messageId}\` resgatada e deletada.`
    })

    async function refundAll() {

        const cachedInArray = await Database.Cache.Bet.all() || []
        const allBetAuthor = cachedInArray.filter(bet => bet?.value?.authorId === user.id)
        let totalValue = 0

        for await (let { id, value } of allBetAuthor) {
            totalValue += parseInt((value.amount || value.value) * ((value.players?.length || [value?.red || [], value?.blue || []].flat().length) || 1))
            await Database.Cache.Bet.delete(value.messageId || id)
            client.emit('betRefund', value, true)
            continue
        }

        return await interaction.reply({
            content: `${e.Check} | Todas as ${allBetAuthor.length} apostas foram resgatas e todos os usuários de todas as apostas receberam seu dinheiro de volta.\n${e.Info} | Um total de **${totalValue} ${await guild.getCoin()}** foram movimentados nessas apostas.`
        })
    }
}