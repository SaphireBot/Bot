// import { time } from "discord.js"
// import { SaphireClient as client, Database } from '../../classes/index.js'

// client.on('guildMemberUpdate', async (oldMember, newMember) => {

//     return;
//     if (!oldMember.guild) return

//     const muteState = {
//         old: oldMember.communicationDisabledUntilTimestamp,
//         new: newMember.communicationDisabledUntilTimestamp
//     }

//     console.log(Date.Timestamp(muteState.new))
//     console.log(new Date(muteState.new))
//     if (muteState.new === null && muteState.old === null) return

//     const guildData = await Database.Guild.findOne({ id: oldMember.guild.id }, 'LogChannel')
//     if (!guildData) return

//     const logChannel = oldMember.guild.channels.cache.get(guildData?.LogChannel)
//     if (!logChannel) return


// })