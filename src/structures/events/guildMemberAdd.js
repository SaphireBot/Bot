import {
    SaphireClient as client,
    Database
} from '../../classes/index.js'
import executeAutorole from './system/execute.autorole.js'

client.on('guildMemberAdd', async member => {

    if (!member.guild.available || member.user.bot) return

    const guildData = await Database.Guild.findOne({ id: member.guild.id }, 'Autorole LogSystem')
    if (!guildData) return Database.registerServer(member.guild)

    if (guildData?.Autorole)
        return executeAutorole({ member, guildData })

    return;
})