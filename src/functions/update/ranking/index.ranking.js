import { Database, Experience, SaphireClient as client } from '../../../classes/index.js'
import { Emojis as e } from '../../../util/util.js'

export default async () => {

    await Experience.set()

    const fields = [
        { name: 'Balance', emoji: e.Bells, title: '👑 Ranking - Global Money' },
        { name: 'Likes', emoji: e.Like, title: '👑 Ranking - Global Likes' },
        { name: 'Xp', emoji: e.RedStar, title: '👑 Ranking - Global Experience' },
        { name: 'GamingCount.Logomarca', emoji: e.logomarca, title: '👑 Ranking - Logomarca Game' },
        { name: 'GamingCount.FlagCount', emoji: '🗺️', title: '👑 Ranking - Bandeiras Game' },
        { name: 'GamingCount.QuizAnime', emoji: '🗺️', title: '👑 Ranking - Quiz Anime Game' }
    ]

    const allUsersData = []
    const hyperQuery = await Database.User.find({}, 'id ' + fields.map(d => d.name).join(' ')) || []

    if (!hyperQuery || !hyperQuery?.length) return
    allUsersData.push(...hyperQuery)

    for await (let field of fields) {
        const data = await getData(field)

        await Database.Cache.Ranking.set(`Rankings.${field.name}`, {
            embed: {
                title: field.title
            },
            query: [...data]
        })
        continue
    }

    return await Database.Cache.General.set('updateTime', Date.now() + (60000 * 15))

    async function getData({ name, emoji }) {

        return name.includes('.')
            ? (() => {
                const broke = name.split('.')
                return [...allUsersData]
                    .filter(data => data[broke[0]][broke[1]] && data[broke[0]][broke[1]] > 0)
                    .sort((a, b) => b[broke[0]][broke[1]] - a[broke[0]][broke[1]])
                    .map(data => ({
                        id: data.id,
                        emoji: emoji,
                        tag: client.users.resolve(data.id)?.tag || null,
                        [`${broke[0]}.${broke[1]}`]: data[broke[0]][broke[1]]
                    }))
            })()
            : [...allUsersData]
                .filter(data => data[name] && data[name] > 0)
                .sort((a, b) => b[name] - a[name])
                .map(data => ({
                    id: data.id,
                    emoji: emoji,
                    tag: client.users.resolve(data.id)?.tag || null,
                    [name]: data[name]
                }))

    }

}