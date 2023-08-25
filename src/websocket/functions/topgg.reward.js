import { SaphireClient as client, Database, Experience } from '../../classes/index.js'
import { CodeGenerator } from '../../functions/plugins/plugins.js'
import { Emojis as e } from '../../util/util.js'
import { Routes } from 'discord.js'
// import managerReminder from '../../functions/update/reminder/manager.reminder.js'
import { socket } from '../websocket.js'

export default async userId => {

    if (!userId) return
    const user = await client.rest.get(Routes.user(userId)).catch(() => null)
    if (!user?.id) return
    giveRewards()

    const data = await Database.Cache.General.get(`TopGG.${userId}`)
    if (!data) return
    await Database.Cache.General.delete(`TopGG.${userId}`)

    if (!data.channelId || !data.messageId) return

    const embed = {
        color: client.green,
        title: `${e.topgg} Top.gg Bot List`,
        description: `${e.Animated.SaphireDance} Recebi seu voto e te dei **+5000 Safiras** e **+1000 XP ${e.RedStar}**`
    }

    if (data.isReminder) {
        // managerReminder.save(user, {
        //     id: CodeGenerator(7).toUpperCase(),
        //     userId: userId,
        //     guildId: data.guildId,
        //     RemindMessage: `Voto disponível no ${e.topgg} Top GG.`,
        //     Time: 43200000,
        //     DateNow: Date.now(),
        //     isAutomatic: true,
        //     ChannelId: data.channelId
        // })
        socket?.send({
            type: "postReminder",
            reminderData: {
                id: CodeGenerator(7).toUpperCase(),
                userId: userId,
                guildId: data.guildId,
                RemindMessage: `Voto disponível no ${e.topgg} Top GG.`,
                Time: 43200000,
                DateNow: Date.now(),
                isAutomatic: true,
                ChannelId: data.channelId
            }
        })
        embed.description += `\n${e.Notification} Como você ativou o lembrete automático, vou te lembrar ${Date.GetTimeout(43200000, Date.now(), 'R')}`
    }

    return client.pushMessage({
        method: 'patch',
        channelId: data.channelId,
        messageId: data.messageId,
        body: {
            method: 'patch',
            messageId: data.messageId,
            channelId: data.channelId,
            embeds: [embed],
            components: []
        }
    })

    async function giveRewards() {
        Experience.add(userId, 1000)


        const transaction = {
            time: `${Date.format(0, true)} - TOP GG`,
            data: `${e.gain} Votou no Top.GG e ganhou 5000 Safiras`
        }

        socket?.send({
            type: "transactions",
            transactionsData: { value: 5000, userId, transaction }
        })

        return await Database.User.findOneAndUpdate(
            { id: userId },
            {
                $inc: { Balance: 5000 },
                $set: { "Timeouts.TopGGVote": Date.now() },
                $push: {
                    Transactions: {
                        $each: [transaction],
                        $position: 0
                    }
                }
            },
            { upsert: true, new: true }
        )
            .then(doc => Database.saveUserCache(doc?.id, doc))
            .catch(() => { })

    }
}