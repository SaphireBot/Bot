import { ButtonInteraction } from "discord.js"
import { Database, SaphireClient as client } from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { "stone | scissors | paper" } click
 */
export default async (interaction, click) => {

    const botChoice = { stone: 'paper', scissors: 'stone', paper: 'scissors' }[click]
    const emoji = choice => {
        return { stone: '👊', scissors: '✌️', paper: '🤚' }[choice]
    }

    await Database.Cache.Jokempo.delete(interaction.message.id)

    return interaction.update({
        content: null,
        embeds: [{
            color: client.blue,
            title: '✌️ Jokempo',
            description: `${e.amongusdance} ${client.user} ganhou jogando ${emoji(botChoice)}\n${e.amongusdeath} ${interaction.user} perdeu jogando ${emoji(click)}`,
            fields: [
                {
                    name: `${e.Animated.SaphireSleeping} Inocente`,
                    value: 'Você realmente pensou que poderia ganhar de mim?'
                }
            ]
        }],
        components: []
    }).catch(() => { })

}