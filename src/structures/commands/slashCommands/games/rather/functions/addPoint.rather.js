import { Database } from "../../../../../../classes/index.js"

export default async (ratherId, option, userId) => {

    if (!ratherId || !option || !userId) return

    await Database.Rather.updateOne(
        { id: ratherId },
        {
            $addToSet: { [`${option}.users`]: userId },
            $pull: { [`${option === 'optionOne' ? 'optionTwo' : 'optionOne'}.users`]: userId }
        }
    )

    const allData = await Database.Rather.find({})
    return allData
}