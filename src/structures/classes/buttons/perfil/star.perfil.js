import { ButtonInteraction } from "discord.js";
import { Emojis as e } from "../../../../util/util.js";
import { Database } from "../../../../classes/index.js";
import { socket } from "../../../../websocket/websocket.js";

const price = {
    "1": 2000000,
    "2": 5000000,
    "3": 10000000,
    "4": 15000000,
    "5": 20000000
}

/**
 * @param { ButtonInteraction } interaction
 * @param { { c: 'star', src: 'buy', num: '1' | '2' | '3' | '4' | '5' } } commandData
 */
export default async (interaction, commandData) => {

    const { user, message } = interaction

    if (user.id != message.interaction?.user?.id)
        return interaction.reply({
            content: `${e.Deny} | Você não pode clicar aqui, sabia?`,
            ephemeral: true
        })

    await interaction.update({ content: `${e.Animated.SaphireReading} | Vendo seus dados e validando sua compra...`, components: [] })

    const userData = await Database.getUser(user.id)

    if ((userData?.Balance || 0) < price[commandData.num])
        return interaction.editReply({
            content: `${e.DenyX} | Você não tem dinheiro suficiente. O valor da **${commandData.num}° Estrela** é de **${price[commandData.num].currency()} Safiras**.`
        }).catch(() => { })

    const NumberToText = {
        "1": "Um",
        "2": "Dois",
        "3": "Tres",
        "4": "Quatro",
        "5": "Cinco"
    }[commandData.num]

    if (userData?.Perfil?.Estrela[NumberToText])
        return interaction.editReply({
            content: `${e.Animated.SaphireReading} | De acordo meus registros, você já possui a **${commandData.num}° Estrela**.`
        }).catch(() => { })

    const transaction = {
        time: `${Date.format(0, true)}`,
        data: `${e.loss} Gastou ${price[commandData.num]} Safiras na ${commandData.num}° Estrela`
    }

    socket?.send({
        type: "transactions",
        transactionsData: { value: price[commandData.num], userId: user.id, transaction }
    })

    await Database.User.findOneAndUpdate(
        { id: user.id },
        {
            $inc: { Balance: -price[commandData.num] },
            $set: { [`Perfil.Estrela.${NumberToText}`]: true },
            $push: {
                Transactions: {
                    $each: [transaction],
                    $position: 0
                }
            }
        },
        { new: true, upsert: true }
    )
        .then(doc => Database.saveUserCache(doc?.id, doc))

    return interaction.editReply({ content: `${e.Animated.SaphireDance} | Parabéns! Você comprou a ${e.Star} **${commandData.num}° Estrela**` }).catch(() => { })
}