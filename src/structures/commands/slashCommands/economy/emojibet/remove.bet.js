import { Database } from "../../../../../classes/index.js"

export default async (participants, value) => {

    for await (let userId of participants) {
        await Database.Cache.EmojiBetRescue.sub(userId, value)
    }
    return
}