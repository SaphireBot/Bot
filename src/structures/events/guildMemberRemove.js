import { SaphireClient as client, Database } from '../../classes/index.js'

client.on('guildMemberRemove', async member => {

    if (!member || !member.guild || !member.guild.available) return

    const guild = await Database.Guild.findOne({ id: member.guild.id }, 'LogChannel LeaveChannel')
    if (!guild) return Database.registerServer(member.guild)

    const LeaveChannel = member.guild.channels.cache.get(guild?.LeaveChannel?.Canal)
    if (!LeaveChannel) return

    if (guild?.LeaveChannel?.Canal && !LeaveChannel) return unset()

    const Mensagem = guild.LeaveChannel.Mensagem || '$member saiu do servidor.'
    const newMessage = Mensagem.replace('$member', member.user.tag).replace('$servername', member.guild.name)

    return LeaveChannel?.send(`${newMessage}`).catch(() => unset())


    async function unset() {
        await Database.Guild.updateOne(
            { id: member.guild.id },
            { $unset: { LeaveChannel: 1 } }
        )
    }

})