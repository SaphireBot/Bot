import { Database, Experience, SaphireClient as client } from '../../../classes/index.js'
import { Emojis as e } from '../../../util/util.js'

export default async () => {

    const clientUsers = await client.shard.fetchClientValues("users.cache").then(cache => cache.flat()).catch(() => [])
    await Experience.set()

    const fields = [
        { globalTag: 'Balance', name: 'Balance', emoji: e.Bells, title: '👑 Ranking - Global Money' },
        { globalTag: 'Likes', name: 'Likes', emoji: e.Like, title: '👑 Ranking - Global Likes' },
        { globalTag: 'Level', name: 'Level', emoji: e.RedStar, title: '👑 Ranking - Global Level Experience' },
        { globalTag: 'DailyCount', name: 'DailyCount', emoji: '🗓️', title: '👑 Ranking - Global Daily Sequency' },
        { globalTag: 'Logomarca', name: 'GamingCount.Logomarca', emoji: e.logomarca, title: '👑 Ranking - Logomarca Game' },
        { globalTag: 'FlagCount', name: 'GamingCount.FlagCount', emoji: '🗺️', title: '👑 Ranking - Bandeiras Game' },
        { globalTag: 'QuizAnime', name: 'GamingCount.QuizAnime', emoji: '🗺️', title: '👑 Ranking - Quiz Anime Game' },
        { globalTag: 'QuizQuestions', name: 'GamingCount.QuizQuestions', emoji: '💭', title: '👑 Ranking - Quiz Question Game' },
    ]

    let allUsersData = []
    const hyperQuery = await Database.User.find({}, 'id ' + fields.map(d => d.name).join(' ')) || []

    if (!hyperQuery || !hyperQuery?.length) return
    allUsersData = hyperQuery

    const TopGlobal = {}

    for await (let field of fields) {
        const data = await getData(field)
        TopGlobal[field.globalTag] = data[0]?.id
        await Database.Cache.Ranking.set(`Rankings.${field.name}`, {
            embed: { title: field.title },
            query: [...data]
        })
        continue
    }

    await Database.Client.findOneAndUpdate(
        { id: client.user.id },
        { $set: { TopGlobal } },
        { new: true, upsert: true }
    ).then(doc => client.clientData = doc?.toObject())

    return await Database.Cache.General.set('updateTime', Date.now() + (60000 * 15))

    async function getData({ globalTag, name, emoji }) {

        return name.includes('.')
            ? (() => {
                const broke = name.split('.')
                return [...allUsersData]
                    .filter(data => data[broke[0]][broke[1]] && data[broke[0]][broke[1]] > 0)
                    .sort((a, b) => b[broke[0]][broke[1]] - a[broke[0]][broke[1]])
                    .map(data => ({
                        id: data.id,
                        emoji: emoji,
                        globalTag,
                        tag: clientUsers.find(u => u.id == data.id)?.username || null,
                        [`${broke[0]}.${broke[1]}`]: data[broke[0]][broke[1]]
                    }))
            })()
            : [...allUsersData]
                .filter(data => data[name] && data[name] > 0)
                .sort((a, b) => b[name] - a[name])
                .map(data => ({
                    id: data.id,
                    emoji: emoji,
                    globalTag,
                    tag: clientUsers.find(u => u.id == data.id)?.username || null,
                    [name]: data[name]
                }))

    }

}