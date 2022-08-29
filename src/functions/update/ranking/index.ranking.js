import {
    Database,
    SaphireClient as client
} from '../../../classes/index.js'
import { Emojis as e } from '../../../util/util.js'

export default async () => {

    if (client.shardId !== 0) return

    const fields = [
        { name: 'Balance', emoji: e.Bells, title: '👑 Ranking - Global Money' },
        { name: 'Likes', emoji: e.Like, title: `${e.Like} Ranking - Global Likes` },
        { name: 'Xp', emoji: e.RedStar, title: `${e.RedStar} Ranking - Global Experience` },
    ]

    const allUsers = client.allUsers

    for await (let field of fields) {
        const data = await getData(field)

        await Database.Cache.Ranking.set(`Rankings.${field.name}`, {
            embed: {
                title: field.title
            },
            query: data
        })
        continue
    }

    return await Database.Cache.General.set('updateTime', new Date(1800000).valueOf())

    async function getData({ name, emoji }) {

        const data = await Database.User.find(
            {},
            [name, 'id'],
            {
                sort: { [name]: -1 },
                limit: 2000
            }
        )

        return data
            .map(result => ({
                id: result.id,
                emoji: emoji,
                tag: allUsers.find(user => user.id === result.id)?.tag || null,
                [name]: result[name]
            }))
            .filter(define => define[name] && define.tag)
    }

}