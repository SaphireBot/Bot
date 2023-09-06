import { SaphireClient as client, Database } from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"
import { socket } from "../../../../../websocket/websocket.js"

export default async ({ Rifa }) => {

    const result = await getRandomWinner()
    const winner = result?.winner
    const number = result?.number
    const prize = parseInt(Rifa.Numbers.length * 1000)

    return winner
        ? addAndResetPrize()
        : acumulePrize()

    async function getRandomWinner() {
        const rifa = Rifa.Numbers.random()
        const winner = await client.users.fetch(rifa.userId).catch(() => null)

        return { number: rifa.number, winner: winner }
    }

    async function addAndResetPrize() {

        const transaction = {
            time: `${Date.format(0, true)}`,
            data: `${e.Admin} Ganhou ${prize} Safiras via *Rifa System Prize Payment*`
        }

        socket?.send({
            type: "transactions",
            transactionsData: { value: prize, userId: winner.id, transaction }
        })

        await Database.User.findOneAndUpdate(
            { id: winner.id },
            {
                $inc: { Balance: prize },
                $push: {
                    Transactions: {
                        $each: [transaction],
                        $position: 0
                    }
                }
            },
            { upsert: true, new: true }
        )
            .then(doc => Database.saveUserCache(doc?.id, doc))

        await Database.Economy.updateOne(
            { id: client.user.id },
            {
                $set: {
                    Rifa: {
                        LastWinner: winner.id,
                        LastNumber: number,
                        LastPrize: prize,
                    }
                }
            },
            { upsert: true }
        )

    }

    async function acumulePrize() {

        await Database.Economy.updateOne(
            { id: client.user.id },
            {
                $inc: {
                    'Rifa.TempPrize': prize
                },
                $set: {
                    'Rifa.LastNumber': number,
                    'Rifa.LastPrize': prize
                },
                $unset: {
                    'Rifa.Numbers': true,
                    'Rifa.LastWinner': true
                }
            },
            { upsert: true }
        )

    }
}