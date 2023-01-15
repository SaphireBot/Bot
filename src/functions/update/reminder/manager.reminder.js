import { Database } from "../../../classes/index.js"
import start from './src/start.reminder.js'

export default new class ReminderManager {
    constructor() {
        this.reminders = []
        this.toDelete = []
    }

    async define() {

        const AllRemindersData = await Database.Reminder.find({}) || []
        if (!AllRemindersData || !AllRemindersData.length) return

        for (const data of AllRemindersData) {

            if (data.Alerted || !data.guildId || !data.RemindMessage || !data.userId) {
                this.toDelete.push(data)
                continue
            }

            const timeRemain = (data.DateNow + data.Time) - Date.now()

            if (timeRemain <= 0) {
                start({ user: data.userId, data })
                continue
            } else setTimeout(() => start({ user: data.userId, data }), timeRemain)
        }

        return this.drop()
    }

    async drop() {
        await Database.Reminder.deleteMany({ id: { $in: this.toDelete.map(r => r.id) } })
    }

    async save(data) {
        return new Database
            .Reminder(data)
            .save()
            .then(doc => doc)
            .catch(err => err)
    }
}