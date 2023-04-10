import { ChatInputCommandInteraction } from "discord.js"
import { TwitchManager } from "../../../../../../classes/index.js"
import { Emojis as e } from "../../../../../../util/util.js"
import categories from './categories.search.twitch.js'
import channels from './channels.search.twitch.js'

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    const input = interaction.options.getString('input').replace(/\s/g, '%20')
    const where = interaction.options.getString('onde')
    
    await interaction.reply({ content: `${e.Loading} | Buscando informações na Twitch...` })
    const query = await TwitchManager.fetcher(`https://api.twitch.tv/helix/search/${where}?query=${input}&first=20`)
    return { categories, channels }[where](interaction, query)

}