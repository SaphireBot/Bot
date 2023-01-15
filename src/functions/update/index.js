import { Database, Experience, SaphireClient as client } from '../../classes/index.js'
import Ranking from './ranking/index.ranking.js'

export default async () => {

    await Ranking()
    client.refreshStaff()

    setInterval(async () => {
        client.fanarts = await Database.Fanart.find() || []
        client.refreshStaff()
    }, 60000)

    setInterval(async () => {
        const allDataUsers = await Database.User.find({})
        client.databaseUsers = allDataUsers.map(data => data.id)
    }, 60000 * 5)

    setInterval(() => {
        client.setMemes()
        client.setCantadas()
    }, 60000)
    setInterval(() => Experience.setExperience(), 1000 * 30)

    if (client.shardId === 0) setInterval(async () => await Ranking(), 60000 * 15)

    const allDataUsers = await Database.User.find({})
    client.databaseUsers = allDataUsers.map(data => data.id)

    return
}