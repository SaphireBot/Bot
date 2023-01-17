import { Emojis as e } from '../../../../util/util.js'
import managerReminder from '../manager.reminder.js'

export default async (user, RemindMessage, dataId) => {
    managerReminder.remove(dataId)
    user?.send(`${e.Notification} | ${user}, lembrete pra você.\n🗒️ | **${RemindMessage}**`).catch(() => { })
    return null
}