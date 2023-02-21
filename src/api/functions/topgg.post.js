
import addReward from '../../functions/topgg/reward.js'

export default async (req, res) => {

    if (req.headers?.authorization !== process.env.TOP_GG_ACCESS)
        return res
            .send({ status: 401, response: "Authorization is not defined correctly." });

    const userId = req.body?.user

    if (!userId)
        return res.status(206).send('A partial content was given.')

    addReward(userId || null).catch(() => null)

    return res.status(200).send()
}