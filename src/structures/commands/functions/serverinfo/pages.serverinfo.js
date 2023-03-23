import { SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import serverinfo from "../../slashCommands/util/serverinfo.js"
import emojis from "./emojis.serverinfo.js"
import numbers from "./numbers.serverinfo.js"
import roles from "./roles.serverinfo.js"
import suplement from "./suplement.serverinfo.js"
import features from "./features.serverinfo.js"

export default async ({ interaction, customId: commandData, value }) => {

    if (commandData.uid !== interaction.user.id)
        return await interaction.reply({
            content: `${e.DenyX} | Ueeepa! Não foi você que usou este comando, né?`,
            ephemeral: true
        })

    if (value == 'cancel')
        return interaction.update({ components: [] }).catch(() => { })

    if (value == 'firstPage')
        return serverinfo.execute({ interaction, client }, commandData, true)

    const guild = await client.guilds.fetch(commandData.id || '0').catch(() => null)

    if (!guild)
        return interaction.update({
            content: `${e.DenyX} | Nenhum servidor foi encontrado.`,
            embeds: [], components: []
        }).catch(() => { })

    if (commandData.sub == 'roles')
        return roles(interaction, guild, commandData)

    const execute = { numbers, emojis, roles, suplement, features }[value]
    if (execute) return execute(interaction, guild)

    return await interaction.reply({ content: `${e.DenyX} | Nenhuma função foi encontrada. #894156`, ephemeral: true })

}