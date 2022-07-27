import { Emojis as e } from '../../../../util/util.js'
import { Database } from '../../../../classes/index.js'

export default async (user, RemindMessage, dataId) => {
    Database.deleteReminders(dataId)
    return user?.send(`${e.Notification} | ${user}, lembrete pra você.\n🗒️ | **${RemindMessage}**`).catch(() => { })
}