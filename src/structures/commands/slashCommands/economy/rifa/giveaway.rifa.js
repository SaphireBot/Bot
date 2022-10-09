import {
    SaphireClient as client,
    Database
} from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"

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

        await Database.User.updateOne(
            { id: winner.id },
            {
                $inc: {
                    Balance: prize
                },
                $push: {
                    Transactions: {
                        $each: [{
                            time: `${Date.format(0, true)}`,
                            data: `${e.Admin} Ganhou ${prize} Safiras via *Rifa System Prize Payment*`
                        }],
                        $position: 0
                    }
                }
            },
            { upsert: true }
        )

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