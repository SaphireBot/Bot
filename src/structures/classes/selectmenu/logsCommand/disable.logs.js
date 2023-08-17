import { Emojis as e } from "../../../../util/util.js"
import { Database } from "../../../../classes/index.js"
import notify from "../../../../functions/plugins/notify.js"

export default async interaction => {

    const { guild, user } = interaction
    const logData = await Database.Guild.findOneAndUpdate(
        { id: guild.id },
        { $unset: { "LogSystem": 1 } },
        { new: true }
    )
        .then(doc => {
            Database.saveGuildCache(doc.id, doc)
            return doc
        })

    const channel = guild.channels.cache.get(logData?.LogSystem?.channel)
    if (channel)
        notify(channel.id, "Log System Disabled", `${user} \`${user.id}\` desativou o sistema de logs.`)

    return interaction.update({
        content: `${e.Check} | O Sistema de Logs *\`Global System Notification (GSN)\`* foi desativado com sucesso.`,
        embeds: [],
        components: []
    }).catch(() => { })
}