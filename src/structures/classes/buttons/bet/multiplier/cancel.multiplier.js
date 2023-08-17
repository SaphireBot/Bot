import { ButtonInteraction } from "discord.js"
import { Database, SaphireClient as client } from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { { src: 'multi', type: 'cancel', id: betId } } commandData
 */
export default async (interaction, commandData) => {

    const { user } = interaction

    if (!commandData?.id)
        return interaction.update({
            content: `${e.saphireDesespero} | Hooooo, não encontrei nada por aqui...`,
            embeds: [], components: []
        }).catch(() => { })

    const gameKey = `${user.id}.${commandData?.id}`
    await interaction.update({
        content: `${e.Loading} | Buscando jogo e devolvendo o dinheiro apostado...`,
        components: [], embeds: []
    }).catch(() => { })

    /**
     * @type { { messageId: String, value: Number, multiplier: Number } } 
     */
    const data = await Database.Cache.Multiplier.get(gameKey)

    if (!data)
        return interaction.editReply({
            content: `${e.saphireDesespero} | Hooooo, não encontrei nada por aqui...`,
            embeds: [], components: []
        }).catch(() => { })

    if (!data?.messageId) return corrupt()

    await giveBackMoney()
    return interaction.editReply({
        content: `${e.Animated.SaphireCry} | Ok, o dinheiro foi devolvido e o jogo deletado...`
    }).catch(() => { })

    async function corrupt() {
        interaction.editReply({
            content: `${e.Animated.SaphireCry} | Haaa não, o game foi corrompido.`,
            embeds: [], components: []
        }).catch(() => { })

        if (data?.value) giveBackMoney()
        return
    }

    async function giveBackMoney() {
        await Database.User.findOneAndUpdate(
            { id: user.id },
            {
                $inc: {
                    Balance: data.value
                }
            },
            { upsert: true, new: true }
        )
            .then(data => Database.saveUserCache(data?.id, data))

        await Database.Cache.Multiplier.delete(gameKey)
        return
    }

}