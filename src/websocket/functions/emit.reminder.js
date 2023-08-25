// import { SaphireClient as client } from "../../classes/index.js"
// import { Emojis as e } from "../../util/util.js"
// import { socket } from "../websocket.js"

// export default async data => {

//     if (!data) return
//     const channel = await client.channels.fetch(data.ChannelId).catch(() => null)
//     if (!channel) return

//     const msg = await channel.send({ content: data.content })
//         .then(msg => {
//             if (msg?.id)
//                 socket?.send({
//                     type: "notification",
//                     notifyData: {
//                         userId: data.userId,
//                         message: data.RemindMessage,
//                         title: "Lembrete"
//                     }
//                 })
//         })
//         .catch(() => null)
//     if (!msg) return


//     const emojis = ['💤', '📅', '🗑️']

//     for (let i of emojis) msg?.react(i).catch(() => { })

//     const collector = msg.createReactionCollector({
//         filter: (r, u) => emojis.includes(r.emoji.name) && u.id === user.id,
//         idle: 1000 * 60 * 60,
//         max: 1,
//         errors: ['idle', 'max']
//     })
//         .on("collect", async (reaction) => {

//             const { emoji } = reaction

//             if (emoji.name === emojis[1]) {
//                 client.pushMessage({
//                     method: 'delete',
//                     channelId: msg.channel.id,
//                     messageId: msg.id
//                 })
//                 // return revalidateTime(channel, user, data)
//             }

//             collector.stop()
//             await msg.reactions.removeAll().catch(() => { })

//             if (emoji.name === emojis[2]) {
//                 // ManagerReminder.remove(data.id)
//                 return msg.edit(`${e.Notification} | ${user}, lembrete pra você.\n🗒️ | **${RemindMessage}**\n${e.Info} | Lembrete deletado.`).catch(() => { })
//             }

//             if (emoji.name === emojis[0])
//                 // return ManagerReminder.snooze(msg, data.id, user)

//             return
//         })
//         .on("end", (_, reason) => {
//             msg.reactions.removeAll().catch(() => { })
//             if (['user', 'limit'].includes(reason)) return
//             // ManagerReminder.remove(data.id)
//             if (!msg) return
//             client.pushMessage({
//                 method: 'patch',
//                 messageId: msg.id,
//                 channelId: msg.channel.id,
//                 body: {
//                     method: 'patch',
//                     messageId: msg.id,
//                     channelId: msg.channel.id,
//                     content: data.content += `\n${e.Info} | Lembrete deletado.`
//                 }
//             })
//             return
//         })
// }