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

    const members = channel.members.filter(member => gameData.players.includes(member.id))

    if (!members.size)
        return await interaction.deferUpdate()

    const { message } = interaction
    const embed = message?.embeds[0]?.data

    let unmuteds = 0

    members.forEach(async member => {
        unmuteds++
        member.voice.setMute(false, 'Among Us Party').catch(() => unmuteds--)
        await unregisterMute(member.id)
    })

    embed.fields[2].value = `${e.Check} Partida Iniciada\n<@${gameData.host}> desmutou ${unmuteds} jogadores`
    return await interaction.update({ embeds: [embed] }).catch(() => { })

    async function unregisterMute(userId) {
        await Database.Cache.AmongUs.pull(`${partyId}.inMute`, userId)
    }

}