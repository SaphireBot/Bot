import { ButtonStyle } from "discord.js"
import {
    SaphireClient as client,
    Database
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import fanartsSaphire from "./fanarts.saphire.js"
import profileSaphire from "./profile.saphire.js"

export default async interaction => {

    const { options } = interaction
    const command = options.get("options")?.value || null

    if (!command)
        return await interaction.reply({
            content: "${e.Deny} | ${GetInputValueResponseNullResult}"
        })

    const execute = {
        profile: profileSaphire,
        fanarts: fanartsSaphire
    }[command]

    if (!execute)
        return await interaction.reply({
            content: "${e.Deny} | ${GetCommandExecuteNullResult}"
        })

    return execute(interaction)
}