import { Modals } from "../../../../classes/index.js"
import infoAnime from "./info.anime.js"
import refreshAnime from "./refresh.anime.js"
import sendOrCancelAnime from "./sendOrCancel.anime.js"
import voteAnime from "./vote.anime.js"

export default async (interaction, { src: customId }) => {

    if (customId === 'indicate')
        return await interaction.showModal(Modals.indicateAnime())

    if (customId === 'refresh')
        return refreshAnime(interaction)

    if (customId === 'info')
        return infoAnime(interaction)

    if (['up', 'down'].includes(customId))
        return voteAnime(interaction, customId)

    if (['cancel', 'send'].includes(customId))
        return sendOrCancelAnime(interaction, customId)

}