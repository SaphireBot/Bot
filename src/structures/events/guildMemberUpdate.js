import { AuditLogEvent } from 'discord.js'
import { SaphireClient as client, Database } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'

client.on('guildMemberUpdate', async (oldMember, newMember) => {

    if (!oldMember.guild) return

    const mute = {
        old: oldMember.communicationDisabledUntil,
        new: newMember.communicationDisabledUntil
    }

    if (!mute.old && !mute.new) return

    const guildData = await Database.Guild.findOne({ id: oldMember.guild.id }, 'LogSystem')
    if (!guildData) return

    if (!guildData?.LogSystem?.mute?.active) return

    const logChannel = newMember.guild.channels.cache.get(guildData?.LogSystem?.channel)
    if (!logChannel) return

    let auditory = {}

    const logs = await newMember.guild.fetchAuditLogs({ type: AuditLogEvent.MemberUpdate }).catch(() => null) // { type: 11 } - ChannelUpdate
    if (!logs) return

    const Log = logs.entries.first()
    if (!Log || Log.action !== AuditLogEvent.MemberUpdate) return

    // const key = 'communication_disabled_until'

    // const changes = [
    //     {
    //         key: 'communication_disabled_until',
    //         old: '2022-12-17T01:36:09.079000+00:00',
    //         new: undefined
    //     }
    // ]

    const { executor, reason } = Log
    if (executor.bot) return

    auditory.executor = `${executor.username}#${executor.discriminator} - \`${executor.id}\``

    if (mute.new && !mute.old)
        return muteAdded()

    if (!mute.new && mute.old)
        return muteRemoved()

    return
    async function muteAdded() {

        const fields = [
            {
                name: `${e.ModShield} Moderador`,
                value: `${auditory.executor || 'Moderador não encontrado'}`
            },
            {
                name: '⏳ Mutado até:',
                value: `\`${getDate(mute.new)}\``
            }
        ]

        if (reason?.length)
            fields.push({
                name: '📝 Motivo',
                value: reason
            })

        return logChannel.send({
            content: '🛰️ | **Global System Notification** | New User Muted',
            embeds: [{
                color: client.blue,
                description: `O usuário ${newMember} \`${newMember.id}\` foi mutado`,
                fields
            }]
        }).catch(err => console.log(err))
    }

    async function muteRemoved() {
        return logChannel.send({
            content: '🛰️ | **Global System Notification** | New User Unmuted',
            embeds: [{
                color: client.blue,
                description: `O mute do usuário ${newMember} \`${newMember.id}\` foi removido`,
                fields: [
                    {
                        name: `${e.ModShield} Moderador`,
                        value: `${auditory.executor || 'Moderador não encontrado'}`
                    },
                    {
                        name: '⏳ Estava mutado até:',
                        value: `\`${getDate(mute.old)}\``
                    }
                ]
            }]
        }).catch(() => { })
    }

    function getDate(time) {
        if (!time) return Date.format()
        return Date.format(new Date(time).getTime() - Date.now())
    }
})