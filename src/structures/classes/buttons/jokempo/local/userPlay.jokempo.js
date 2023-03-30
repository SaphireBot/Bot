import { ButtonInteraction } from "discord.js"
import { Database, SaphireClient as client } from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"
import finish from "./finish.jokempo.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { "stone" | "paper" | "scissors" } click
 * 
 */
export default async (interaction, click) => {

    const { message, user, guild } = interaction

    // { players: [], value: 0, clicks: { "123": null, "321": null } }
    const game = await Database.Cache.Jokempo.get(message.id)

    if (!game)
        return interaction.update({
            content: `${e.Deny} | Jogo não encontrado no cache.`,
            components: []
        })

    if (!game.players.includes(user.id))
        return interaction.reply({
            content: `${e.cry} | Você não faz parte desse jokempo.`,
            ephemeral: true
        })

    if (game.clicks[user.id])
        return interaction.reply({
            content: `${e.DenyX} | Calminha, você já jogou.`,
            ephemeral: true
        })

    const emoji = { stone: '👊', scissors: '✌️', paper: '🤚' }[click]
    const callback = await Database.Cache.Jokempo.set(`${message.id}.clicks.${user.id}`, emoji)
    const clicks = Object.entries(callback.clicks) // [["string", "emoji" | null], ["string", "emoji" | null]]

    if (clicks[0][1] && clicks[1][1])
        return finish(interaction, callback)

    const description = [
        clicks[0][1]
            ? `${e.CheckV} <@${callback.players[0]}> já escolheu`
            : `${e.Loading} <@${callback.players[0]}> ainda não escolheu`,
        clicks[1][1]
            ? `${e.CheckV} <@${callback.players[1]}> já escolheu`
            : `${e.Loading} <@${callback.players[1]}> ainda não escolheu`
    ].join('\n')

    const MoedaCustom = await guild.getCoin()
    return await interaction.update({
        embeds: [{
            color: client.blue,
            title: '✌️ Jokempo',
            description,
            fields: [{
                name: `${e.Tax} Valor Apostado`,
                value: `**${game.value.currency()} ${MoedaCustom}**`
            }]
        }]
    }).catch(() => { })

}