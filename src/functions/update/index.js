import { Database, Experience, SaphireClient as client } from '../../classes/index.js';

export default () => {

    setInterval(async () => {
        client.setCantadas()
        Experience.set()
        client.fanarts = await Database.Fanart.find() || []
    }, 1000 * 60)

    setInterval(() => client.refreshStaff(), 1000 * 60 * 15)

    return
}