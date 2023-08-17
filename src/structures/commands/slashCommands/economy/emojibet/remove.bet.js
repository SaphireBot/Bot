import { Database } from "../../../../../classes/index.js"

export default async (participants, value) => {

    for await (let objUser of participants) {
        await Database.Cache.EmojiBetRescue.sub(objUser.user, value)
    }

    return
}