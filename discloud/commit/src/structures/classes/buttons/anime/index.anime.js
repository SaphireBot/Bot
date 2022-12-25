import { Modals } from "../../../../classes/index.js"
import refreshAnime from "./refresh.anime.js"
import infoAnime from "./info.anime.js"
import deleteAnime from "./delete.anime.js"
import voteAnime from "./vote.anime.js"
import sendOrCancelAnime from "./sendOrCancel.anime.js"

export default async (interaction, { src: customId }) => {

    if (customId === 'indicate')
        return await interaction.showModal(Modals.indicateAnime())

    if (customId === 'refresh')
        return refreshAnime(interaction)

    if (customId === 'info')
        return infoAnime(interaction)

    if (customId === 'delete')
        return deleteAnime(interaction)

    if (['up', 'down'].includes(customId))
        return voteAnime(interaction, customId)

    if (['cancel', 'send'].includes(customId))
        return sendOrCancelAnime(interaction, customId)

}