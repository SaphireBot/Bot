import { ButtonInteraction } from "discord.js"
import { Database, SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import check from "./check.jokempo.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { { players: [], value: 0, clicks: { "123": null, "321": null } } } gameData
 */
export default async (interaction, gameData) => {

    const { clicks, players, value } = gameData
    const { message, guild } = interaction
    const winner = check(clicks)
    const MoedaCustom = await guild.getCoin()

    if (winner == 'draw') return draw()

    const winnerId = winner[0]
    addReward()

    const description = [
        winnerId == players[0]
            ? `${e.amongusdance} <@${players[0]}> ganhou jogando ${clicks[players[0]]}`
            : `${e.amongusdeath} <@${players[0]}> perdeu jogando ${clicks[players[0]]}`,
        winnerId == players[1]
            ? `${e.amongusdance} <@${players[1]}> ganhou jogando ${clicks[players[1]]}`
            : `${e.amongusdeath} <@${players[1]}> perdeu jogando ${clicks[players[1]]}`,
    ].join('\n')

    Database.Cache.Jokempo.delete(message.id)
    return await interaction.update({
        embeds: [{
            color: client.blue,
            title: '✌️ Jokempo',
            description,
            fields: [{
                name: `${e.Tax} Valor Apostado`,
                value: `**${value.currency()} ${MoedaCustom}**\n<@${winnerId}> ganhou a aposta.`
            }]
        }],
        components: []
    }).catch(() => { })

    async function draw() {
        const reward = value > 0 ? parseInt(value / 2) : 0

        interaction.update({
            embeds: [{
                color: client.blue,
                title: '✌️ Jokempo',
                description: `🏳️ <@${players[0]}> jogou ${clicks[players[0]]}\n🏳️ <@${players[1]}> também jogou ${clicks[players[1]]}`,
                fields: [{
                    name: `${e.Tax} Valor Apostado`,
                    value: value > 0
                        ? `**${value.currency()} ${MoedaCustom}**\nPor empatarem, receberam de volta **${reward.currency()} ${MoedaCustom}** *(Metade do valor apostado)*`
                        : `**${value.currency()} ${MoedaCustom}**`
                }]
            }],
            components: []
        }).catch(() => { })

        if (!reward || reward <= 0) return

        await Database.User.updateMany(
            { id: { $in: players } },
            {
                $inc: { Balance: reward },
                $push: {
                    Transactions: {
                        $each: [{
                            time: `${Date.format(0, true)}`,
                            data: `${e.gain} Ganhou ${reward} Safiras em um empate no *Jokempo*`
                        }],
                        $position: 0
                    }
                }
            }
        )
        return
    }

    async function addReward() {
        if (!value || value < 0) return
        await Database.User.updateOne(
            { id: winnerId },
            {
                $inc: { Balance: value * 2 },
                $push: {
                    Transactions: {
                        $each: [{
                            time: `${Date.format(0, true)}`,
                            data: `${e.gain} Ganhou ${value * 2} Safiras apostando no *Jokempo*`
                        }],
                        $position: 0
                    }
                }
            }
        )
    }

}