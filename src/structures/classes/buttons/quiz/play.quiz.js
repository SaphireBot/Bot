import { Emojis as e } from "../../../../util/util.js"
export default async interaction => {

    if (interaction.user.id !== interaction.message?.interaction?.user?.id)
        return await interaction.reply({
            content: `${e.DenyX} | Epa epa, só <@${interaction.message?.interaction?.user?.id}> pode usar essa função, beleza?`,
            ephemeral: true
        })

    return await interaction.update({ content: `${e.Loading} | Jogo em construção... Tente novamente daqui algumas horas.`, components: [], embeds: [] }).catch(() => { })
}