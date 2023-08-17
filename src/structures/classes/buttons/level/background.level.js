import { Database } from '../../../../classes/index.js'
import { ButtonInteraction } from 'discord.js'
import { Emojis as e } from '../../../../util/util.js'
import { readFileSync, writeFileSync } from 'fs'
import { socket } from '../../../../websocket/websocket.js'

/**
 * @param { ButtonInteraction } interaction
 */
export default async interaction => {

    const { user, message } = interaction
    const customId = JSON.parse(interaction.customId)
    const background = Database.BgLevel[customId.id]

    if (!background)
        return interaction.update({
            content: `${e.Animated.SaphireCry} | Wallpaper não encontrado.`,
            embeds: [], components: []
        }).catch(() => { })

    if (customId.src !== 'buy')
        return interaction.update({
            content: `${e.DenyX} | Caminho de funções desconhecido.`,
            embeds: [], components: []
        }).catch(() => { })

    if (
        message.interaction &&
        message.interaction.user.id !== user.id
    )
        return interaction.reply({
            content: `${e.Deny} | Você não pode mexer aqui, sabia?`,
            ephemeral: true
        })

    if (
        (background.Limit && background.Limit == 0)
        || background.Limit < -1
    )
        return interaction.update({
            content: `${e.Animated.SaphireReading} | O estoque do wallpaper **${background.Name}** está esgotado.`,
            embeds: [], components: []
        }).catch(() => { })

    const userData = await Database.getUser(user.id)

    if (userData?.Walls?.Bg?.includes(customId.id))
        return interaction.update({
            content: `${e.Animated.SaphireReading} | Estou vendo aqui nos meus registros e você já possui o wallpaper **${background.Name}**.`,
            embeds: [], components: []
        }).catch(() => { })

    if ((userData?.Balance || 0) < background.Price)
        return interaction.reply({
            content: `${e.Animated.SaphireReading} | Eu verifiquei aqui e você não possui o dinheiro necessário para comprar o background **${background.Name}**. Você tem exatamente **${userData?.Balance || 0} Safiras**.`,
            ephemeral: true
        })

    await interaction.update({
        content: `${e.Loading} | Efetuando a compra do background **${background.Name}**...`,
        embeds: [], components: []
    }).catch(() => { })

    const transaction = {
        time: `${Date.format(0, true)}`,
        data: `${e.loss} Comprou o background \`${customId.id}\` por ${background.Price} Safiras.`
    }

    socket?.send({
        type: "transactions",
        transactionsData: { value: background.Price, userId: user.id, transaction }
    })

    return await Database.User.findOneAndUpdate(
        { id: user.id },
        {
            $inc: { Balance: -background.Price },
            $push: {
                Transactions: {
                    $each: [transaction],
                    $position: 0
                }
            },
            $addToSet: {
                "Walls.Bg": customId.id
            }
        },
        { new: true, upsert: true }
    )
        .then(doc => {
            Database.saveUserCache(doc.id, doc)

            addCredits()

            const data = JSON.parse(readFileSync('./JSON/levelwallpapers.json', { encoding: 'utf-8' }))
            if (data[customId.id].Limit > 0) data[customId.id].Limit--
            writeFileSync('./JSON/levelwallpapers.json', JSON.stringify(data), { encoding: 'utf-8' })

            interaction.editReply({
                content: `${e.Animated.SaphireDance} | Você comprou o background **${background.Name}** com sucesso.`,
                embeds: [], components: []
            }).catch(() => { })
            return
        })
        .catch(err => interaction.editReply({
            content: `${e.Animated.SaphirePanic} | Deu erro na compra do wallpaper.\n${e.bug} | \`${err}\``
        }).catch(() => { }))

    async function addCredits() {

        if (!customId?.cmt) return

        const prize = parseInt(background.Price * 0.04)
        if (prize <= 0) return

        const transaction = {
            time: `${Date.format(0, true)}`,
            data: `${e.gain} Ganhou ${prize} Safiras via *Background Commision*`
        }

        socket?.send({
            type: "transactions",
            transactionsData: { value: prize, userId: customId?.cmt, transaction }
        })

        await Database.User.findOneAndUpdate(
            { id: customId?.cmt },
            {
                $inc: { Balance: prize },
                $push: {
                    Transactions: {
                        $each: [transaction],
                        $position: 0
                    }
                }
            },
            { new: true, upsert: true }
        )
            .then(doc => Database.saveUserCache(doc.id, doc))
        return

    }

}