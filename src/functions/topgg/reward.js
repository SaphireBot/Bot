import { SaphireClient as client, Database, Experience } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'
import { CodeGenerator } from '../../functions/plugins/plugins.js'
import { Routes } from 'discord.js'
import managerReminder from '../update/reminder/manager.reminder.js'

export default async userId => {

    if (!userId) return
    const user = await client.rest.get(Routes.user(userId)).catch(() => null)
    if (!user || user.id !== userId) return
    giveRewards()

    const data = await Database.Cache.General.get(`TopGG.${userId}`)
    if (!data) return
    await Database.Cache.General.delete(`TopGG.${userId}`)

    if (!data.channelId || !data.messageId) return

    const embed = {
        color: client.green,
        title: `${e.topgg} | Top.gg Bot List`,
        description: `${e.Check} | Recebi seu voto e te dei **+5000 Safiras** e **+1000 XP ${e.RedStar}**`
    }

    if (data.isReminder) {
        managerReminder.save(user, {
            id: CodeGenerator(7).toUpperCase(),
            userId: userId,
            guildId: data.guildId,
            RemindMessage: `Voto disponível no ${e.topgg} Top GG.`,
            Time: 43200000,
            DateNow: Date.now(),
            isAutomatic: true,
            ChannelId: data.channelId
        })
        embed.description += `\n${e.Notification} | Como você ativou o lembrete automático, vou te lembrar ${Date.GetTimeout(43200000, Date.now(), 'R')}`
    }

    return client.rest.patch(
        Routes.channelMessage(data.channelId, data.messageId),
        { body: { embeds: [embed], components: [] } }
    )
        .catch(() => { })

    async function giveRewards() {
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