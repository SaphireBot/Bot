import { SaphireClient as client, Database } from "../../../../classes/index.js"
import { Permissions, PermissionsTranslate } from "../../../../util/Constants.js"
import { Emojis as e } from "../../../../util/util.js"
import disableLogs from "./disable.logs.js"

export default async ({ interaction, values: keys }) => {

    const { guild, user, message } = interaction

    if (user.id !== message.interaction.user.id)
        return await interaction.reply({
            content: `${e.saphireLeft} | Eu acho que não foi você que usou este comando, foi?`,
            ephemeral: true
        })

    if (!guild.clientHasPermission(Permissions.ViewAuditLog))
        return await interaction.reply({
            content: `${e.Deny} | Eu preciso da permissão **\`${PermissionsTranslate.ViewAuditLog}\`** para executar este comando.`,
            ephemeral: true
        })

    const values = keys.map(customId => JSON.parse(customId)?.src)

    if (values.includes("disabled"))
        return disableLogs(interaction)

    const logData = await Database.Guild.findOne({ id: guild.id }, "LogSystem")

    const baseData = {
        kick: logData?.LogSystem?.kick?.active || false,
        ban: logData?.LogSystem?.ban?.active || false,
        unban: logData?.LogSystem?.unban?.active || false,
        channels: logData?.LogSystem?.channels?.active || false,
        messages: logData?.LogSystem?.messages?.active || false,
        mute: logData?.LogSystem?.mute?.active || false,
        botAdd: logData?.LogSystem?.botAdd?.active || false
    }

    const toUpdate = {}

    for (let key of values) {

        const primaryKey = {
            Expulsão: "LogSystem.kick.active",
            Banimento: "LogSystem.ban.active",
            Desbanimento: "LogSystem.unban.active",
            Canais: "LogSystem.channels.active",
            Mensagens: "LogSystem.messages.active",
            Mute: "LogSystem.mute.active",
            Bots: "LogSystem.botAdd.active"
        }[key]

        const result = {
            Expulsão: !baseData?.kick,
            Banimento: !baseData?.ban,
            Desbanimento: !baseData?.unban,
            Canais: !baseData?.channels,
            Mensagens: !baseData?.messages,
            Mute: !baseData?.mute,
            Bots: !baseData?.bot
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

    const logChannel = await guild.channels.fetch(guildData?.LogSystem?.channel).catch(() => null)

    const dataToArray = [
        { active: guildData?.LogSystem?.ban?.active || false, name: "Banimento" },
        { active: guildData?.LogSystem?.unban?.active || false, name: "Desbanimento" },
        { active: guildData?.LogSystem?.kick?.active || false, name: "Expulsão" },
        { active: guildData?.LogSystem?.channels?.active || false, name: "Canais" },
        { active: guildData?.LogSystem?.messages?.active || false, name: "Mensagens" },
        { active: guildData?.LogSystem?.mute?.active || false, name: "Mute" },
        { active: guildData?.LogSystem?.botAdd?.active || false, name: "Bots" },
        { active: guildData?.LogSystem?.roles?.active || false, name: "ROLES_LOGS_BUILDING" }
    ]

    const componentOptions = dataToArray.map(data => {

        const emoji = {
            Banimento: "🔨",
            Desbanimento: "🙏",
            Expulsão: "🦶",
            Mute: "🔇",
            Canais: "💬",
            Mensagens: "🗨",
            Bots: "🤖"
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
            ? e.CheckV
            : key.name.includes("_")
                ? e.Loading
                : e.DenyX

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
                    value: textValue || "`NOT_EMBED_FIELD_VALUE_FOUND`"
                },
                {
                    name: "#️⃣ Canal",
                    value: `${logChannel || "`Channel Not Found`"}`
                },
                {
                    name: "📜 Permissões",
                    value: `Eu preciso da permissão **\`${PermissionsTranslate.ViewAuditLog}\`**\nQuem for gerenciar este sistema, precisa da permissão **\`${PermissionsTranslate.ManageGuild}\`**`
                },
                {
                    name: `${e.Info} Status`,
                    value: `${e.CheckV} Sistema de logs ativado\n${e.DenyX} Sistema de logs desativado\n${e.Loading} Sistema de logs em construção\n${e.Warn} Sistema de logs em manutenção`
                }
            ]
        }],
        components: [{
            type: 1,
            components: [{
                type: 3,
                custom_id: 'logs',
                placeholder: logChannel?.id ? 'Ativar/Desativar Logs' : 'Um canal é necessário',
                disabled: logChannel?.id ? false : true,
                max_values: dataToArray.length - 1,
                options: componentOptions
            }]
        }]
    })
}