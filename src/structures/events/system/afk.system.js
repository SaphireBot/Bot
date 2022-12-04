import { Database } from "../../../classes/index.js"
import { Emojis as e } from "../../../util/util.js"

export default async message => {

    if (!message?.id || !message?.guild) return

    const { guild, author, member } = message
    const serverAFK = await Database.Cache.AfkSystem.get(guild.id) || {}
    const globalAFK = await Database.Cache.AfkSystem.get("Global") || {}
    const inServerAuthorAFK = serverAFK[author.id]
    const inGlobalAuthorAFK = globalAFK[author.id]

    if (member.displayName.includes('[AFK]'))
        member.setNickname(member.displayName.replace('[AFK]', ''), 'AFK Command Disable').catch(() => { })

    if (inServerAuthorAFK || inGlobalAuthorAFK) {

        Database.Cache.AfkSystem.delete(`${guild.id}.${author.id}`).catch(() => { })
        Database.Cache.AfkSystem.delete(`Global.${author.id}`).catch(() => { })

        const msg = await message.reply({
            content: inServerAuthorAFK ? `${e.Afk} | O sistema de AFK foi desativado automáticamente.` : `${e.Afk} | O sistema de AFK Global foi desativado automáticamente.`
        }).catch(() => null)

        if (msg === null) return

        return setTimeout(() => msg.delete()?.catch(() => { }), 10000)
    }

    const mentions = message.mentions.members
    if (!mentions.size) return

    let content = ""

    mentions.forEach(Member => {

        const globalMessage = globalAFK[Member.user.id]
        if (globalMessage) {
            if (!Member?.displayName?.includes('[AFK]'))
                Member.setNickname(`${Member.displayName} [AFK]`, 'AFK Command Enable').catch(() => { })

            content += `\n${e.Afk} | ${Member.user.tag} está offline globalmente.${globalMessage === 'No Message' ? "" : `\n📝 | ${globalMessage}`}\n`
        }

        const serverMessage = serverAFK[Member.user.id]
        if (serverMessage)
            content += `\n${e.Afk} | ${Member.user.tag} está offline.${serverMessage === 'No Message' ? "" : `\n📝 | ${serverMessage}`}\n`

        if (!globalMessage && !serverMessage && Member?.displayName?.includes('[AFK]'))
            Member.setNickname(Member.displayName.replace('[AFK]', ''), 'AFK Command Desabled').catch(() => { })
    })

    if (content.length > 0) {

        const msg = await message.reply({
            content: content.limit('MessageContent')
        }).catch(() => null)

        if (msg === null) return

        return setTimeout(() => msg?.delete()?.catch(() => { }), 7000)
    }

    return
}