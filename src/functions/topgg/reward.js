import {
    SaphireClient as client,
    Database,
    Experience
} from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'
import { CodeGenerator } from '../../functions/plugins/plugins.js'
import managerReminder from '../update/reminder/manager.reminder.js'

export default async userId => {

    if (!userId) return

    const user = await client.users.fetch(userId || '0').catch(() => null)
    if (!user) return
    giveRewards()

    const data = await Database.Cache.General.get(`TopGG.${userId}`)
    if (!data) return
    await Database.Cache.General.delete(`TopGG.${userId}`)
    
    const guild = await client.guilds.fetch(data.guildId || '0').catch(() => null)
    if (!guild) return

    const channel = await guild.channels.fetch(data.channelId || '0').catch(() => null)
    if (!channel) return

    const message = await channel.messages.fetch(data.messageId || '0').catch(() => null)
    if (!message) return

    const embed = message.embeds[0]?.data
    if (!embed) return

    embed.description = `${e.Check} | Recebi seu voto e te dei **+5000 ${await channel.guild.getCoin()}** e **+1000 XP ${e.RedStar}**`
    embed.color = client.green

    if (data.isReminder) {
        managerReminder.save(user, {
            id: CodeGenerator(7).toUpperCase(),
            userId: userId,
            guildId: data.guildId,
            RemindMessage: `Voto disponível no ${e.topgg} Top GG.`,
            Time: 43200000,
            DateNow: Date.now(),
            isAutomatic: true,
            ChannelId: channel.id
        })
        embed.description += `\n${e.Notification} | Como você ativou o lembrete automático, vou te lembrar ${Date.GetTimeout(43200000, Date.now(), 'R')}`
    }

    await message.edit({ embeds: [embed], components: [] }).catch(() => { })

    async function giveRewards() {

        await client.sendWebhook(
            process.env.WEBHOOK_TOP_GG_COUNTER,
            {
                avatarURL: process.env.TOP_GG_WEBHOOK_AVATAR,
                username: "[API] Top GG Vote Notification",
                content: `${user.tag} \`${userId}\` votou na ${client.user.username} e ganhou 5000 ${e.Coin} Safiras mais 1000 ${e.RedStar} XP.`
            }
        ).catch(() => { })

        Experience.add(userId, 1000)

        return await Database.User.updateOne(
            { id: userId },
            {
                $inc: { Balance: 5000 },
                $push: {
                    Transactions: {
                        $each: [{
                            time: `${Date.format(0, true)} - TOP GG`,
                            data: `${e.gain} Votou no Top.GG e ganhou 5000 Safiras`
                        }],
                        $position: 0
                    }
                }
            },
            { upsert: true }
        )
            .catch(() => { })

    }
}