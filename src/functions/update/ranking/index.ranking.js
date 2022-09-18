import {
    Database,
    Experience,
    SaphireClient as client
} from '../../../classes/index.js'
import { Emojis as e } from '../../../util/util.js'

export default async () => {

    await Experience.setExperience()

    const fields = [
        { name: 'Balance', emoji: e.Bells, title: '👑 Ranking - Global Money' },
        { name: 'Likes', emoji: e.Like, title: `${e.Like} Ranking - Global Likes` },
        { name: 'Xp', emoji: e.RedStar, title: `${e.RedStar} Ranking - Global Experience` }
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

        return [...allUsersData]
            .filter(data => data[name] && data[name] > 0)
            .sort((a, b) => b[name] - a[name])
            .map(data => ({
                id: data.id,
                emoji: emoji,
                tag: client.users.resolve(data.id)?.tag || null,
                [name]: data[name]
            }))
            .filter(data => data.tag)
            .slice(0, 2000)

    }

}