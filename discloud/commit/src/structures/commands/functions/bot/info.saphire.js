import profileSaphire from "./profile.saphire.js"

export default async interaction => {

    const { options } = interaction
    const command = options.get("options")?.value || null

    if (!command)
        return await interaction.reply({
            content: "${e.Deny} | ${GetInputValueResponseNullResult}"
        })

    const execute = {
        profile: profileSaphire
    }[command]

    if (!execute)
        return await interaction.reply({
            content: "${e.Deny} | ${GetCommandExecuteNullResult}"
        })

    return execute(interaction)
}