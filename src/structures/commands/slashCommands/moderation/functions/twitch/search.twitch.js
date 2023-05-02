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
    const query = await TwitchManager.fetcher(`https://api.twitch.tv/helix/search/${where}?query=${input}&first=25`)

    if (query == 'TIMEOUT')
        return interaction.editReply({
            content: `${e.SaphireDesespero} | Aaaaah, o sistema da Twitch está pegando FOOOOGO 🔥\n🧑‍🚒 | Fica tranquilo, que tudo está normal em menos de 1 minuto. ||Rate limit é uma coisinha chata||`
        }).catch(() => { })

    return { categories, channels }[where](interaction, query)
}