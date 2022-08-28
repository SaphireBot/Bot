import { Database, SaphireClient as client } from '../../../../../classes/index.js'

export default async ({ interaction, e }) => {

    const { options, user, guild } = interaction
    const messageId = options.getString('available_bets')
    if (messageId === 'all') return refundAll()

    const cachedData = await Database.Cache.Bet.get(`Bet.${messageId}`)

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

        const cachedData = await Database.Cache.Bet.get('Bet') || {}
        const cachedInArray = Object.values(cachedData || {})
        const allBetAuthor = cachedInArray.filter(bet => bet.authorId === user.id)
        let totalValue = 0

        for await (let { amount, players, messageId } of allBetAuthor) {
            totalValue += parseInt(amount * players.length)
            await Database.Cache.Bet.delete(`Bet.${messageId}`)
            client.emit('betRefund', { players, amount, messageId }, true)
            continue
        }

        return await interaction.reply({
            content: `${e.Check} | Todas as ${allBetAuthor.length} apostas foram resgatas e todos os usuários de todas as apostas receberam seu dinheiro de volta.\n${e.Info} | Um total de **${totalValue} ${await guild.getCoin()}** foram movimentados nessas apostas.`
        })
    }
}