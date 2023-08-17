import { ButtonInteraction } from "discord.js";
import { Emojis as e } from "../../../../util/util.js";
import { Database, SaphireClient as client } from "../../../../classes/index.js";
import divorce from "./divorce.buttons.js";
import { socket } from "../../../../websocket/websocket.js";

/**
 * @param { ButtonInteraction } interaction
 * @param { { 
 *    c: 'marry', 
 *    src: 'accept' | 'deny' | 'divorce'
 *    userId: string,
 *    memberId: string
 * } } commandData
 */
export default async (interaction, commandData) => {

    const { user } = interaction
    const { src, userId, memberId } = commandData

    if (src == 'divorce') return divorce(interaction)

    if (![userId, memberId].includes(user.id))
        return interaction.reply({
            content: `${e.Deny} | Você não pode clicar aqui, beleza?`,
            ephemeral: true
        })

    if (src == 'deny')
        return interaction.update({
            content: `${e.Animated.SaphireCry} | O pedido foi recusado por ${user}. Que pena...`,
            components: []
        }).catch(() => { })

    if (user.id !== memberId)
        return interaction.reply({
            content: `${e.Deny} | Você não pode aceitar o pedido, ok?`,
            ephemeral: true
        })

    await interaction.update({ content: `${e.Loading} | Validando dados...`, components: [] })
    const usersData = await Database.getUsers([userId, memberId])
    const userData = usersData.find(d => d.id == userId)
    const memberData = usersData.find(d => d.id == memberId)

    if (userData?.Perfil?.Marry?.Conjugate)
        return interaction.editReply({
            content: `${e.Animated.SaphireReading} | Nos meus registros, <@${userId}> já está em um casamento.`
        }).catch(() => { })

    if (memberData?.Perfil?.Marry?.Conjugate)
        return interaction.editReply({
            content: `${e.Animated.SaphireReading} | Em uma breve verificação, <@${memberId}> já está em um casamento.`
        }).catch(() => { })

    if (
        (userData?.Balance || 0) < 50000
        || (memberData?.Balance || 0) < 50000
    )
        return interaction.editReply({
            content: `${e.Animated.SaphireReading} | Ambos tem que ter 50.000 Safiras para efetuar um casamento.`
        }).catch(() => { })

    await interaction.editReply({
        content: `${e.Loading} | Salvando os dados e autenticando o casamento...`,
        components: []
    }).catch(() => { })

    const dateNow = Date.now()

    const transaction = {
        time: `${Date.format(0, true)}`,
        data: `${e.loss} Gastou 50000 Safiras no casamento.`
    }

    socket?.send({
        type: "transactions",
        transactionsData: { value: 50000, userId, transaction }
    })

    await Database.User.findOneAndUpdate(
        { id: userId },
        {
            $inc: { Balance: -50000 },
            $push: {
                Transactions: {
                    $each: [transaction],
                    $position: 0
                }
            },
            $set: {
                "Perfil.Marry.Conjugate": memberId,
                "Perfil.Marry.StartAt": dateNow
            }
        },
        { new: true, upsert: true }
    )
        .then(doc => Database.saveUserCache(doc?.id, doc))

    socket?.send({
        type: "transactions",
        transactionsData: { value: 50000, userId: memberId, transaction }
    })

    await Database.User.findOneAndUpdate(
        { id: memberId },
        {
            $inc: { Balance: -50000 },
            $push: {
                Transactions: {
                    $each: [transaction],
                    $position: 0
                }
            },
            $set: {
                "Perfil.Marry.Conjugate": userId,
                "Perfil.Marry.StartAt": dateNow
            }
        },
        { new: true, upsert: true }
    )
        .then(doc => Database.saveUserCache(doc?.id, doc))

    const commandId = client.application.commands.cache.find(c => c.name === "profile")?.id

    return interaction.editReply({
        content: `# 💍 Parabéns ao novo casal! 💍\n> <@${userId}> & <@${memberId}> se uniram 💝\n*Vocês podem ver seus nomes no </profile:${commandId}> junto com o tempo de casados.*`
    }).catch(() => { })
}