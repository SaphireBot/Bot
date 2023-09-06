import { SaphireClient as client } from "../../../../../../classes/index.js"
import { Emojis as e } from "../../../../../../util/util.js"
import AnimeQuizManager from "./class.anime.js"

export default async interaction => {

    const { channel } = interaction
    if (client.chatsInGame.includes(channel.id))
        return await interaction.reply({
            content: `${e.Deny} | Este canal já tem um game rolando. Espere ele terminar para começar outro, ok?`,
            ephemeral: true
        })

    return new AnimeQuizManager(interaction).analise()

}