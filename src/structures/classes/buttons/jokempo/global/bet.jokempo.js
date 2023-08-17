import { ButtonInteraction } from "discord.js"
import { Database, SaphireClient as client } from "../../../../../classes/index.js"
import { JokempoValues } from "../../../../../util/Constants.js"
import { Emojis as e } from "../../../../../util/util.js"

/**
 * @param { ButtonInteraction } interaction
 */
export default async interaction => {

    const { user, guild, message } = interaction

    if (user.id != message.interaction.user.id)
        return interaction.reply({
            content: `${e.DenyX} | Você não pode usar ele comando, sabia? Que tal você mesmo usar o \`/jokempo global\`?`,
            ephemeral: true
        })

    await interaction.update({ content: `${e.Loading} | Carregando informações globais...`, embeds: [], components: [] }).catch(() => { })

    const selectMenu = { type: 1, components: [{ type: 3, custom_id: 'jkp', placeholder: 'Escolher Uma Aposta Global', options: [] }] }
    const MoedaCustom = await guild.getCoin()
    const jokempos = await Database.Jokempo.find() || []
    const userBalance = await Database.getUser(user.id)
    const balance = userBalance?.Balance || 0

    for (const value of JokempoValues) {
        const jokempoLength = jokempos.filter(data => data.value == value).length || 0
        selectMenu.components[0].options.push({
            label: `${value.currency()} Safiras`,
            emoji: jokempoLength > 0
                ? balance - value >= 0 ? e.CheckV : e.DenyX
                : balance - value >= 0 ? e.Animated.SaphireCry : e.DenyX,
            description: balance - value >= 0
                ? jokempoLength > 0 ? `${jokempoLength} apostas disponíveis` : 'Nenhum aposta disponível'
                : 'Dinheiro Insuficiente',
            value: JSON.stringify({ c: 'jkp', type: 'exec', value: value })
        })
    }

    const totalValue = jokempos.reduce((acc, cur) => acc += (cur.value || 0), 0) || 0

    const embed = {
        color: client.blue,
        title: `${e.Planet} ${client.user.username}'s Jokempo Global`,
        description: `Atualmente, você possui **${balance.currency()} ${MoedaCustom}** e **${jokempos.length} Jokempos** Globais.\nTodas as suas apostas no jokempos, somam um total de **${totalValue.currency()} ${MoedaCustom}**.`,
        fields: [
            {
                name: `${e.SaphireWhat} Agora é só escolher`,
                value: 'Hum... Qual aposta será que você vai escolher?'
            }
        ]
    }

    return interaction.editReply({ content: null, embeds: [embed], components: [selectMenu] }).catch(() => { })

}