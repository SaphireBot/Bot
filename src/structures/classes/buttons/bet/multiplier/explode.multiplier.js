import { Database, SaphireClient as client } from "../../../../../classes/index.js";
import { ButtonInteraction, ButtonStyle } from "discord.js";
import { Emojis as e } from "../../../../../util/util.js";

/**
 * @param { ButtonInteraction } interaction
 */
export default async interaction => {

    const { user, message } = interaction

    const components = generateButtonsExploded()
    await Database.Cache.Multiplier.delete(`${user.id}.${message.id}.prize`)

    const embed = message.embeds[0]?.data
    embed.color = client.red
    embed.fields.push({
        name: `${e.Animated.SaphireCry} Perdeeeeu`,
        value: 'É uma pena, mas você acabou de perder todo o seu dinheiro apostado.'
    })

    return interaction.editReply({ embeds: [embed], components }).catch(() => { })

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
                button.style = button.custom_id == interaction.customId
                    ? ButtonStyle.Danger
                    : button.style
                button.emoji = customId.e == 1
                    ? button.custom_id == interaction.customId ? '💥' : '💣'
                    : '💎'
            }

        return components
    }
}