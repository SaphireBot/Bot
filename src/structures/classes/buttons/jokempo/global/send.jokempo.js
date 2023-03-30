import { ButtonInteraction } from "discord.js"
import { Database, SaphireClient as client } from "../../../../../classes/index.js"
import { JokempoValues } from "../../../../../util/Constants.js"
import { Emojis as e } from "../../../../../util/util.js"

/**
 * @param { ButtonInteraction } interaction
 */
export default async interaction => {

    const { user, guild } = interaction
    const MoedaCustom = await guild.getCoin()
    const selectMenu = { type: 1, components: [{ type: 3, custom_id: 'jkp', placeholder: 'Escolher Valor', options: [] }] }
    const jokempos = await Database.Jokempo.find({ creatorId: user.id }) || []
    const userBalance = await Database.User.findOne({ id: user.id }, 'Balance')
    const balance = userBalance?.Balance || 0
    const emojis = [e.pedra, e.tesoura, e.papel]

    for (const value of JokempoValues)
        selectMenu.components[0].options.push({
            label: `${value.currency()} Safiras`,
            emoji: balance - value >= 0 ? emojis.random() : e.DenyX,
            description: balance - value >= 0 ? 'Você tem dinheiro para esta aposta' : 'Dinheiro Insuficiente',
        value: JSON.stringify({ c: 'jkp', type: 'select', value: value })
        })

    const totalValue = jokempos.reduce((acc, cur) => acc += (cur.value || 0), 0) || 0

    const embed = {
        color: client.blue,
        title: `${e.Planet} ${client.user.username}'s Jokempo Global`,
        description: `Atualmente, você possui **${balance.currency()} ${MoedaCustom}** e **${jokempos.length} Jokempos** Globais.\nTodas as suas apostas no jokempos, somam um total de **${totalValue.currency()} ${MoedaCustom}**.`,
        fields: [
            {
                name: `${e.QuestionMark} E agora?`,
                value: 'Escolha um valor que você deseja lançar para o Jokempo Global, logo depois, você escolhará a sua jogada.'
            }
        ]
    }

    return interaction.update({ embeds: [embed], components: [selectMenu] }).catch(() => { })
}