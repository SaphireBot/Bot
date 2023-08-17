import {
    SaphireClient as client,
    Database,
    Logomarca
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async interaction => {

    const channelsInGame = await Database.Cache.Logomarca.get(`${client.shardId}.Channels`) || []

    if (channelsInGame.includes(interaction.channel.id))
        return await interaction.reply({
            content: `${e.Deny} | Já tem um logomarca rolando nesse chat.`,
            ephemeral: true
        })

    return new Logomarca(interaction, Database.Logomarca).registerNewGameAndStart()

}