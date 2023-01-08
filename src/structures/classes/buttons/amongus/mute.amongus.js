import { DiscordPermissons, PermissionsTranslate } from "../../../../util/Constants.js"
import deleteParty from "./delete.amongus.js"

export default async ({ interaction, partyId, channel, gameData, e, guild, Database, user }) => {

    if (user.id !== gameData.host)
        return await interaction.reply({
            content: `${e.Deny} | Apenas o Host <@${gameData.host}> pode mutar e desmutar os membros da call.`,
            ephemeral: true
        })

    if (!guild.members.me.permissions.has(DiscordPermissons.MuteMembers, true)) {
        deleteParty(partyId)
        return await interaction.update({
            content: `${e.Deny} | Eu estou sem a permissão de **\`${PermissionsTranslate.MuteMembers}\`**, eu deleitei o jogo só de raiva.`
        }).catch(() => { })
    }

    const members = channel.members.filter(member =>
        [...gameData.players, ...gameData.deaths].includes(member.id)
        && !member.voice.serverMute
    )

    if (!members.size)
        return await interaction.deferUpdate()

    const { message } = interaction
    const embed = message?.embeds[0]?.data

    let muteds = 0

    members.forEach(async member => {
        muteds++
        member.voice.setMute(true, 'Among Us Party').catch(() => muteds--)
        await registerMute(member.id)
    })

    embed.fields[2].value = `${e.Check} Partida Iniciada\n<@${gameData.host}> silencou ${muteds} jogadores`
    return await interaction.update({ embeds: [embed] }).catch(() => { })

    async function registerMute(userId) {
        await Database.Cache.AmongUs.push(`${partyId}.inMute`, userId)
    }

}