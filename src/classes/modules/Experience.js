import Database from '../database/Database.js'

export default new class Experience {
    constructor() {
        // [{ id: '1234567', xp: 10 }, { id: '1234568', xp: 7 }]
        // this.users = []
        this.users = new Map()
    }

    add(userId, xpPoints) {
        return this.users.set(userId, (xpPoints + (this.users.get(userId) || 0)))
    }

    async set() {

        if (!this.users.size) return

        // const usersData = await Database.getUsers(this.users.map(d => d.id))

        const usersEntries = Array.from(this.users.entries())
        const data = []

        for (const [key, value] of usersEntries) {
            this.users.delete(key)
            data.push({ key, value })
        }

        const usersData = await Database.getUsers(data.map(d => d.key))
        if (!usersData || !usersData.length) return

        const dataToUpdate = []

        for (let { key, value } of data) {

            const user = usersData.find(d => d.id === key)
            let level = user?.Level || 1
            let levelEdited = false
            let xp = value += (user?.Xp || 0)

            do {

                if (xp >= parseInt((level || 1) * 275)) {
                    level++
                    levelEdited = true
                    xp -= parseInt((level) * 275)
                    if (xp < 0) xp = 0
                }

            } while (xp >= parseInt((level) * 275))

            const dataToPush = {
                updateOne: {
                    filter: { id: key },
                    update: { $set: { Xp: xp } },
                    upsert: true
                }
            }

            if (levelEdited)
                dataToPush.updateOne.update.$set.Level = level

            dataToUpdate.push(dataToPush)
            continue
        }

        await Database.User.collection.bulkWrite(dataToUpdate, { ordered: true }, () => { })

        for (const data of usersData)
            Database.saveUserCache(data?.id, data)

        return
    }

}