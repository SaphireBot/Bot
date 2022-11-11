import {
    SaphireClient as client,
    Database
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import disableLogs from "./disable.logs.js"

export default async ({ interaction, values: keys }) => {

    const { guild, user, message } = interaction

    if (user.id !== message.interaction.user.id)
        return await interaction.reply({
            content: `${e.saphireLeft} | Eu acho que não foi você que usou este comando, foi?`,
            ephemeral: true
        })

    const values = keys.map(customId => JSON.parse(customId)?.src)

    if (values.includes("disabled"))
        return disableLogs(interaction)

    const logData = await Database.Guild.findOne({ id: guild.id }, "LogSystem")

    const baseData = {
        kick: logData?.LogSystem?.kick?.active || false
    }

    const toUpdate = {}

    for (let key of values) {

        const primaryKey = {
            Expulsão: "LogSystem.kick.active"
        }[key]

        const result = {
            Expulsão: !baseData?.kick
        }[key]

        if (!primaryKey && !result) continue;

        toUpdate[primaryKey] = result
        continue;
    }

    const guildData = await Database.Guild.findOneAndUpdate(
        { id: guild.id },
        { $set: toUpdate },
        { upsert: true, new: true }
    )

    const logChannel = guild.channels.cache.get(guildData?.LogSystem?.channel)
    const dataToArray = [
        { ...guildData?.LogSystem?.ban, name: "BAN_LOGS_BUILDING" },
        { ...guildData?.LogSystem?.kick, name: "Expulsão" },
        { ...guildData?.LogSystem?.mute, name: "MUTE_LOGS_BUILDING" },
        { ...guildData?.LogSystem?.mute, name: "ROLES_LOGS_BUILDING" },
        { ...guildData?.LogSystem?.mute, name: "MESSAGES_LOGS_BUILDING" },
        { ...guildData?.LogSystem?.mute, name: "CHANNELS_LOGS_BUILDING" }
    ]

    const componentOptions = dataToArray.map(data => {

        const emoji = {
            Banimento: "🔨",
            Expulsão: "🦶",
            Mute: "🔇"
        }[data.name] || e.Loading

        return {
            label: `${data.active ? "Desativar" : "Ativar"} Notificação de ${data.name}`,
            emoji,
            value: JSON.stringify({ src: data.name })
        }

    })

    if (logChannel.id)
        componentOptions.push({
            label: "Desativar Sistema GSN",
            emoji: e.Deny,
            value: JSON.stringify({ c: 'logs', src: "disabled" })
        })

    const textValue = dataToArray.map(key => {
        const emoji = key.active
            ? "🟢"
            : key.name.includes("_")
                ? e.Loading
                : "🔴"

        return `${emoji} ${key.name}`
    }).join("\n")

    return await interaction.update({
        embeds: [{
            color: client.blue,
            title: "🛰 Global System Notification",
            description: "Um super sistemas de avisos automáticos.\nSimplificado, com qualidade e facilidade.",
            fields: [
                {
                    name: "📨 Logs",
                    value: `${textValue}`
                },
                {
                    name: "#️⃣ Canal",
                    value: `${logChannel || "\`Channel Not Found\`"}`
                }
            ]
        }],
        components: [{
            type: 1,
            components: [{
                type: 3,
                custom_id: 'logs',
                placeholder: 'Ativar/Desativar Logs',
                disabled: logChannel?.id ? false : true,
                max_values: 6,
                options: componentOptions
            }]
        }]
    })
}