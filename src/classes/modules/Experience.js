import { GuildScheduledEventPrivacyLevel } from "discord.js"
import Database from "../database/Database.js"

export default new class Experience {
    constructor() {
        // [{ id: '1234567', xp: 10 }, { id: '1234568', xp: 7 }]
        this.users = []
    }

    addXp(userId, xpPoints) {
        const userData = this.users.find(user => user.id === userId)

        userData
            ? userData.xp += xpPoints
            : this.users.push({ id: userId, xp: xpPoints })
        return
    }

    async setExperience() {

        if (this.users.length === 0) return

        const usersData = await Database.User.find({ id: { $in: this.users.map(d => d.id) } })
        if (!usersData || !usersData.length) return

        const dataToUpdate = []

        for (let data of this.users) {

            const user = usersData.find(d => d.id === data.id)
            let level = user.Level || 1
            let xp = data.xp += (user.Xp || 0)

            do {
                if (xp <= 0) break;

                if (xp >= parseInt((level || 1) * 275)) {
                    level++
                    xp -= parseInt((level) * 275)
                    if (xp < 0) xp = 0
                } else break;
            } while (xp <= parseInt((level) * 275))

            dataToUpdate.push({
                updateOne: {
                    filter: { id: data.id },
                    update: {
                        $set: {
                            Xp: data.xp,
                            Level: level
                        }
                    },
                    upsert: true
                }
            })

            continue
        }

        Database.User.collection.bulkWrite(dataToUpdate, { ordered: true }, () => { })

        return this.users = []
    }

}