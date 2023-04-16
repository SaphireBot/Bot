import { SaphireClient as client, Database } from '../../classes/index.js'
import newMember from './functions/add.guildMemberAdd.js'
import executeAutorole from './system/execute.autorole.js'

client.on('guildMemberAdd', async member => {

    if (!member.guild.available) return

    const guildData = await Database.Guild.findOne({ id: member.guild.id }, 'Autorole LogSystem WelcomeChannel')
    if (!guildData) return Database.registerServer(member.guild)

    if (guildData?.Autorole)
        executeAutorole({ member, guildData })

    if (guildData.WelcomeChannel?.channelId)
        newMember(member, guildData.WelcomeChannel)

    return;
})