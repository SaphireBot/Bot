import { Emojis as e } from '../../../../../../util/util.js'
import {
    Database,
    SaphireClient as client
} from '../../../../../../classes/index.js'

export default async ({ interaction }) => {

    const { options, user, guild } = interaction
    const query = options.getString('blackjacks')
    if (query === 'all') return refundAll()

    const gameData = await Database.Cache.Blackjack.get(query)

    if (!gameData) {
        return await interaction.reply({
            content: `${e.Deny} | Dados do jogo não encontrado.`,
            ephemeral: true
        })
    }

    if (gameData?.players?.length) {
        client.emit('blackjackRefund', gameData)

        const responseValue = gameData.bet > 0
            ? `Devolvi o valor de **${gameData.bet} ${await guild.getCoin()}** ${gameData.availablePlayers.length > 1 ? 'para todos.' : `para <@${gameData.availablePlayers[0]}>`}`
            : `Como nenhum valor foi apostado, não devolvi nada pra ninguém.`

        return await interaction.reply({
            content: `${e.Check} | Tudo certo. Nesse jogo, ${gameData.availablePlayers.length} jogador${gameData.availablePlayers.length > 1 ? 'es pagaram' : ' pagou'} o preço da aposta. ${responseValue}`
        })
    }

    await Database.Cache.Blackjack.delete(query)

    if (gameData.bet > 0) {
        Database.add(user.id, gameData.bet)
        return await interaction.reply({
            content: `${e.Check} | Prontinho! Você resgatou um blackjack perdido no valor de **${gameData.bet} ${await guild.getCoin()}**`
        })
    }

    return await interaction.reply({
        content: `${e.Deny} | Esse blackjack não tem nenhum valor para ser resgatado.`,
        ephemeral: true
    })

    async function refundAll() {
        const allGameData = await Database.Cache.Blackjack.all()
        const userGames = allGameData.filter(data => data.value.userId === user.id)
        const availableGamesRefund = userGames.filter(data => !data.value.multiplayers)

        if (!availableGamesRefund || !availableGamesRefund.length)
            return await interaction.reply({
                content: `${e.Deny} | Não achei nenhum jogo para ser resgatado.`,
                ephemeral: true
            })

        const totalAmount = parseInt(availableGamesRefund.reduce((acc, elem) => acc += elem.value.bet, 0))
        deleteAllGames()

        if (!totalAmount || totalAmount < 1)
            return await interaction.reply({
                content: `${e.Deny} | A soma de todos os seus jogos para serem resgatados são de **0 ${await guild.getCoin()}**.\n${e.Info} | Todos os jogos resgatados forão deletados.`,
                ephemeral: true
            })

        Database.add(user.id, totalAmount, `${e.gain} Recebeu ${totalAmount} Safiras via *Blackjack Refund*`)

        return await interaction.reply({
            content: `${e.Check} | Tudo foi um sucesso! A soma dos ${availableGamesRefund.length} Blackjacks totalizaram **${totalAmount} ${await guild.getCoin()}**.\n${e.Info} | Todos os jogos resgatados foram deletados.\n${e.saphireRight} | Se você tentar jogar qualquer jogo que foi resgatado, ele será cancelado.`
        })

        async function deleteAllGames() {
            for await (let data of availableGamesRefund)
                await Database.Cache.Blackjack.delete(data.id)
        }
    }
}