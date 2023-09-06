import { SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import serverinfo from "../../slash/util/serverinfo.js"
import emojis from "./emojis.serverinfo.js"
import numbers from "./numbers.serverinfo.js"
import roles from "./roles.serverinfo.js"
import suplement from "./suplement.serverinfo.js"
import features from "./features.serverinfo.js"
import images from "./images.serverinfo.js"
import { Routes } from "discord.js"
export const ServerinfoCachedData = new Map()

export default async ({ interaction, customId: commandData, value }) => {

    if (commandData?.src == 'info')
        return serverinfo.execute({ interaction }, commandData, false, true)

    if (commandData.uid !== interaction.user.id)
        return interaction.reply({
            content: `${e.DenyX} | Ueeepa! Não foi você que usou este comando, né?`,
            ephemeral: true
        })

    if (value == 'cancel')
        return interaction.update({ components: [] }).catch(() => { })

    if (value == 'firstPage')
        return serverinfo.execute({ interaction }, commandData, true)

    if (value == "refresh") {
        interaction.message.edit({ components: interaction.message.components }).catch(() => { })

        await interaction.reply({
            content: `${e.Loading} | Atualizando servidor no cache...`,
            ephemeral: true
        })

        const data = await client.rest.get(Routes.guild(commandData?.id)).catch(() => null)

        if (!data)
            return interaction.editReply({ content: `${e.DenyX} | Não foi possível atualizar o servidor.` }).catch(() => { })

        ServerinfoCachedData.set(commandData.id, data)
        return interaction.editReply({ content: `${e.CheckV} | Servidor atualizado com sucesso.` }).catch(() => { })

    }

    const guild = ServerinfoCachedData.get(commandData.id) || await client.getGuild(commandData.id)

    if (!ServerinfoCachedData.has(commandData.id)) {
        ServerinfoCachedData.set(commandData.id, guild)
        setTimeout(() => ServerinfoCachedData.delete(), 1000 * 60 * 10)
    }

    if (!guild)
        return interaction.update({
            content: `${e.DenyX} | Nenhum servidor foi encontrado.`,
            embeds: [], components: []
        }).catch(() => { })

    if (commandData.sub == 'roles')
        return roles(interaction, guild, commandData)

    const execute = { numbers, emojis, roles, suplement, features, images }[value]
    if (execute) return execute(interaction, guild)

    return interaction.reply({ content: `${e.DenyX} | Nenhuma função foi encontrada. #894156`, ephemeral: true })

}