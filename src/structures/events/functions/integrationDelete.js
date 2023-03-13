import { GuildAuditLogsEntry, Guild } from 'discord.js';
import { Database } from '../../../classes/index.js';

/**
 * @param { GuildAuditLogsEntry } log
 * @param { Guild } guild
 */
export default async (log, guild) => {

    const integration = log?.target
    if (!log || !integration || !guild) return

    const guildData = await Database.Guild.findOne({ id: guild.id }, 'LogSystem')
    if (!guildData || !guildData?.LogSystem?.channel || !guildData?.LogSystem?.botAdd?.active) return

    const logChannel = await guild.channels.fetch(guildData?.LogSystem?.channel)?.catch(() => null)
    if (!logChannel) return

    const executor = await guild.members.fetch(log.executorId).then(member => member.user).catch(() => null)

    return await logChannel.send({
        content: `🛰️ | **Global System Notification** | Bot Deleted\n \n**${executor?.tag || '\`Not Found\`'} \`${executor?.id || '0'}\`** removeu o bot **${integration?.name || '\`Not Found\`'} \`${integration?.id || '0'}\`**`,
    }).catch(() => { })
}