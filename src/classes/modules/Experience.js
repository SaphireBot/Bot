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

        const bulkOptions = this.users.map(data => {
            return {
                updateOne: {
                    filter: { id: data.id },
                    update: {
                        $inc: {
                            Xp: data.xp
                        }
                    },
                    upsert: true
                }
            }
        })

        Database.User.collection.bulkWrite(bulkOptions, { ordered: true }, () => { })

        return this.users = []
    }

}