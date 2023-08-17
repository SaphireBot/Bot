import { ButtonInteraction } from "discord.js";
import { Database } from "../../../../../classes/index.js";
import { Emojis as e } from "../../../../../util/util.js";
import { socket } from "../../../../../websocket/websocket.js";

/**
 * @param { ButtonInteraction } interaction
 * @param { { value: Number, mines: Number, prize: Number } } data
 */
export default async (interaction, data) => {

    const { user, message, guild } = interaction

    if (!data)
        return interaction.update({
            content: `${e.Animated.SaphireCry} | Nenhum jogo foi encontrado...`,
            embeds: [], components: []
        })
            .catch(() => { })

    await interaction.update({ content: `${e.Loading} | Resgatando jogo...`, embeds: [], components: [] }).catch(() => { })
    const prize = parseInt(data?.prize || 0)

    const transaction = {
        time: `${Date.format(0, true)}`,
        data: `${e.gain} Ganhou ${prize.currency()} Safiras no *Bet Multiplier*`
    }

    socket?.send({
        type: "transactions",
        transactionsData: { value: prize, userId: user.id, transaction }
    })

    return await Database.User.findOneAndUpdate(
        { id: user.id },
        {
            $inc: { Balance: prize },
            $push: {
                Transactions: {
                    $each: [transaction],
                    $position: 0
                }
            }
        },
        { upsert: true, new: true }
    )
        .then(async doc => {
            Database.saveUserCache(doc?.id, doc)

            const moeda = await guild.getCoin()
            await Database.Cache.Multiplier.delete(`${user.id}.${message.id}`)
            const components = generateButtonsExploded()
            interaction.editReply({
                content: `${e.Animated.SaphireDance} | Parabéns! Você apostou **${(data?.value || 0).currency()} ${moeda}** e ganhou **${prize.currency()} ${moeda}**.`,
                embeds: [], components
            }).catch(() => { })
            return
        })
        .catch(err => interaction.editReply({
            content: `${e.Animated.SaphireCry} | Não foi possível finalizar este jogo.\n${e.bug} | \`${err}\``
        }).catch(() => { }))

    function generateButtonsExploded() {
        const components = [
            message.components[0].toJSON(),
            message.components[1].toJSON(),
            message.components[2].toJSON(),
            message.components[3].toJSON(),
            message.components[4].toJSON()
        ]

        for (const row of components)
            for (const button of row.components) {
                const customId = JSON.parse(button.custom_id)
                button.disabled = true
                if (customId?.id == 'finish') continue
                button.emoji = customId.e == 1 ? '💣' : '💎'
            }

        return components
    }
}