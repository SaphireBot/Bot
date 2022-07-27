import { Database, SaphireClient as client } from '../../../classes/index.js'
import reminderStart from './src/start.reminder.js'

export default async () => {

    const AllRemindersData = await Database.Reminder.find({}) || []

    if (!AllRemindersData || AllRemindersData.length === 0) return

    for (const data of AllRemindersData) {

        const user = await client.users.fetch(data.userId)

        user
            ? reminderStart({ user, data })
            : Database.deleteReminders(data.userId, true)

        continue
    }

    return
}