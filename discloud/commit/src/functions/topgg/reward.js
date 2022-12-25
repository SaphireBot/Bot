import {
    SaphireClient as client,
    Database
} from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'
import { Api } from '@top-gg/sdk'
import { CodeGenerator } from '../../functions/plugins/plugins.js'
const TopGGApi = new Api(process.env.TOP_GG_TOKEN)

export default async (userId) => {

    if (!userId) return false

    const user = await client.users.fetch(userId).catch(() => null)
    if (!user) return false
    giveRewards()

    const votes = await TopGGApi.getVotes() || []
    const cachedData = await Database.Cache.General.get(`${client.shardId}.TopGG`)
    const data = cachedData?.find(data => data?.userId === userId)

    await Database.Cache.General.pull(`${client.shardId}.TopGG`, data => data.userId === userId)
    if (!data) return await giveRewards()

    const channel = await client.channels.fetch(data.channelId)
    if (!channel) return false

    const message = await channel.messages.fetch(data.messageId)
    if (!message) return false

    const embed = message.embeds[0]?.data
    if (!embed) return false

    embed.description = `${e.Check} | Recebi seu voto e te dei **+5000 ${await channel.guild.getCoin()}** e **+1000 XP ${e.RedStar}**`
    embed.color = client.green

    if (data.isReminder) {
        new Database.Reminder({
            id: CodeGenerator(7).toUpperCase(),
            userId: userId,
            RemindMessage: `Voto disponível no ${e.topgg} Top GG.`,
            Time: 43200000,
            DateNow: Date.now(),
            isAutomatic: true,
            ChannelId: channel.id
        }).save()

        embed.description += `\n${e.Notification} | Como você ativou o lembrete automático, vou te lembrar ${Date.GetTimeout(43200000, Date.now(), 'R')}`
    }

    return message.edit({ embeds: [embed], components: [] })
        .then(() => {
            return {
                content: `${user?.tag} \`${userId || 0}\` aumentou os votos da ${client.user.tag} para ${votes.length}`,
                avatarURL: 'https://media.discordapp.net/attachments/893361065084198954/1005310889588703332/top.gg_logo.png?width=484&height=484',
                username: 'Top GG Vote Notification'
            }
        })
        .catch(() => false)

    async function giveRewards() {

        return await Database.User.updateOne(
            { id: userId },
            {
                $inc: {
                    Balance: 5000,
                    Xp: 1000
                },
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
            .then(() => {
                return {
                    content: `${user?.tag} \`${userId || 0}\` aumentou os votos da ${client.user.tag} para ${votes.length}`,
                    avatarURL: 'https://media.discordapp.net/attachments/893361065084198954/1005310889588703332/top.gg_logo.png?width=484&height=484',
                    username: 'Top GG Vote Notification'
                }
            })
            .catch(() => false)

    }
}