import { ChatInputCommandInteraction } from "discord.js"
import { Emojis as e } from "../../../../../util/util.js"
import { Database } from "../../../../../classes/index.js"
import layout from './layout.tempcall.js'

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async (interaction, guildData) => {

    const { options, guild } = interaction
    const method = options.getString('method')

    return { reset, layout }[method](interaction, guildData)

    async function reset() {
        await interaction.reply({ content: `${e.Loading} | Carregando...` })

        await Database.Guild.findOneAndUpdate(
            { id: guild.id },
            { $unset: { 'TempCall.members': true } },
            { new: true }
        )
            .then(data => Database.saveGuildCache(data.id, data))

        return interaction.editReply({
            content: `${e.CheckV} | Ranking de Tempo em Call resetado.`
        }).catch(() => { })
    }

}