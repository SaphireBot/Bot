import { ButtonInteraction } from "discord.js"
import { Database } from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"
import { socket } from "../../../../../websocket/websocket.js"

/**
 * @param { ButtonInteraction } interaction
 */
export default async interaction => {

    const { customId, user, message } = interaction
    const customIdData = JSON.parse(customId)
    const gameData = await Database.Cache.Jokempo.get(message.id)

    if (!gameData)
        return interaction.update({
            content: `${e.Deny} | Jogo não encontrado no cache.`,
            components: []
        }).catch(() => { })

    if (![message.interaction.user.id, customIdData.userId].includes(user.id))
        return await interaction.reply({
            content: `${e.Deny} | Calminha, calminha! Só quem <@${message.interaction.user.id}> & <@${customIdData.userId}> podem recusar este jogo.`,
            ephemeral: true
        })

    if (gameData.value > 0) {

        const transaction = {
            time: `${Date.format(0, true)}`,
            data: `${e.gain} Recebeu de volta ${gameData.value} Safiras na recusa de um Jokempo`
        }

        socket?.send({
            type: "transactions",
            transactionsData: { value: gameData.value, userId: gameData.players[0], transaction }
        })

        await Database.User.findOneAndUpdate(
            { id: gameData.players[0] },
            {
                $inc: {
                    Balance: gameData.value
                },
                $push: {
                    Transactions: {
                        $each: [transaction],
                        $position: 0
                    }
                }
            },
            { upsert: true, new: true }
        )
            .then(doc => Database.saveUserCache(doc?.id, doc))
    }

    Database.Cache.Jokempo.delete(message.id)
    return interaction.update({
        content: `${e.DenyX} | ${user} recusou esta partida de jokempo.`,
        components: []
    }).catch(() => { })

}