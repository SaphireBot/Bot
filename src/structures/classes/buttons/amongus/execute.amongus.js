import {
    SaphireClient as client,
    Database
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import cancel from "./cancel.amongus.js"
import copy from "./copy.amongus.js"
import deleteParty from "./delete.amongus.js"
import join from "./join.amongus.js"
import leave from "./leave.amongus.js"
import mute from "./mute.amongus.js"
import restart from "./restart.amongus.js"
import startAmongus from "./start.amongus.js"
import unmute from "./unmute.amongus.js"

export default async ({ interaction, user, guild }, commandData) => {

    const execute = { join, leave, cancel, restart, copy, unmute, init: startAmongus, mute }[commandData.src]
    const partyId = commandData.partyId || "undefined"

    if (!execute)
        return await interaction.reply({
            content: `${e.Deny} | Nenhuma sub-função encontrada. #6155`,
            ephemeral: true
        })

    const partyData = await Database.Cache.AmongUs.get(partyId)
    if (!partyData) {
        deleteParty()
        return await interaction.update({
            content: `${e.Deny} | Jogo não encontrado.`,
            embeds: [],
            components: []
        }).catch(() => { })
    }

    const channel = await guild.channels.cache.get(partyData.channelId)
    if (!channel) {
        deleteParty()
        return await interaction.update({
            content: `${e.Deny} | Não foi possível obter o canal do jogo.`,
            embeds: [],
            components: []
        })
    }

    if (channel.members.size < 4) {
        deleteParty(partyId)
        return await interaction.update({
            content: `${e.Deny} | Não tem participantes o suficiente no canal de voz ${channel}.\n${e.Info} | Quando houver 4 ou mais participantes, use o comando novamente.`,
            embeds: [],
            components: []
        })
    }

    return execute({
        channel,
        client,
        guild,
        Database,
        e,
        interaction,
        partyData,
        partyId,
        user,
        gameData: partyData
    })

}