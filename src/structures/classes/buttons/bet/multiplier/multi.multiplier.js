import { StringSelectMenuInteraction } from "discord.js";
import { Emojis as e } from "../../../../../util/util.js";
import { Database } from "../../../../../classes/index.js";

/**
 * @param { StringSelectMenuInteraction } interaction
 */
export default async interaction => {

    const { values, message, user } = interaction

    if (user.id !== message.interaction.user.id)
        return interaction.reply({
            content: `${e.Animated.SaphireQuestion} | Eu acho que você não pode clicar aqui, ok?`,
            ephemeral: true
        })

    const content = message.content
    const components = [message.components[0].toJSON(), message.components[1].toJSON()]
    const embed = message.embeds[0]?.data

    await interaction.update({ content: `${e.Loading} | Buscando, alterando e salvando o multiplicador`, components: [] }).catch(() => { })
    const data = await Database.Cache.Multiplier.get(`${user.id}.${message.id}`)

    if (!data)
        return interaction.editReply({
            content: `${e.Animated.SaphireCry} | Os dados desse jogo não foi encontrado.`,
            embeds: []
        }).catch(() => { })

    /**
     * @type { 1 ... 24 } 
     */
    const value = Number(values[0])
    await Database.Cache.Multiplier.set(`${user.id}.${message.id}.mines`, value)
    await Database.Cache.Multiplier.set(`${user.id}.${message.id}.multiplierValue`, data.value * (value * 0.041666666))
    embed.fields[1] = { name: '💣 Número de Minas', value: `${value} minas -> x${(value * 0.041666666).toFixed(3)}` }
    components[1].components[1].disabled = false

    return interaction.editReply({ content, components, embeds: [embed] }).catch(() => { })

}