import { Colors, Permissions, PermissionsTranslate } from "../../../../util/Constants.js";
import { ApplicationCommandOptionType } from "discord.js";

export default {
    name: 'logs',
    description: '[moderation] Gerencie os meus sistemas de logs por aqui',
    category: "moderation",
    dm_permission: false,
    default_member_permissions: Permissions.ManageGuild,
    type: 1,
    options: [
        {
            name: 'config_channel',
            description: "Configure um canal para receber as notificações do GSN",
            type: ApplicationCommandOptionType.Channel,
            channel_types: [0, 5]
        }
    ],
    helpData: {
        description: 'Sistema frontal para gerenciar os logs'
    },
    async execute({ interaction, e, Database }) {

        const { guild, options } = interaction

        if (!guild.clientHasPermission(Permissions.ViewAuditLog))
            return await interaction.reply({
                content: `${e.Deny} | Eu preciso da permissão **\`${PermissionsTranslate.ViewAuditLog}\`** para executar este comando.`,
                ephemeral: true
            })

        const configChannel = options.getChannel('config_channel') || null
        const guildData = await Database.Guild.findOne({ id: guild.id }, "LogSystem")

        if (configChannel) return setChannel()

        const logChannel = await guild.channels.fetch(guildData?.LogSystem?.channel).catch(() => null)

        if (!logChannel)
            return await interaction.reply({
                content: `${e.Deny} | Você precisa escolher um canal usando \`/logs config_channel:\` antes de acessar este comando.`,
                ephemeral: true
            })

        const dataToArray = [
            { ...guildData?.LogSystem?.ban, name: "Banimento" },
            { ...guildData?.LogSystem?.unban, name: "Desbanimento" },
            { ...guildData?.LogSystem?.kick, name: "Expulsão" },
            { ...guildData?.LogSystem?.channels, name: "Canais" },
            { ...guildData?.LogSystem?.mute, name: "MUTE_LOGS_BUILDING" },
            { ...guildData?.LogSystem?.mute, name: "ROLES_LOGS_BUILDING" },
            { ...guildData?.LogSystem?.mute, name: "MESSAGES_LOGS_BUILDING" }
        ]

        const componentOptions = dataToArray.map(data => {

            const emoji = {
                Banimento: "🔨",
                Desbanimento: "🙏",
                Expulsão: "🦶",
                Mute: "🔇",
                Canais: "💬"
            }[data.name] || e.Loading

            return {
                label: `${data.active ? "Desativar" : "Ativar"} Notificação de ${data.name}`,
                emoji,
                value: JSON.stringify({ c: 'logs', src: data.name })
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
                ? e.Check
                : key.name.includes("_")
                    ? e.Loading
                    : e.Deny

            return `${emoji} ${key.name}`
        }).join("\n")

        return await interaction.reply({
            embeds: [{
                color: Colors.Blue,
                title: "🛰 Global System Notification",
                description: "Um super sistemas de avisos automáticos.\nSimplificado, com qualidade e facilidade.",
                fields: [
                    {
                        name: "📨 Logs",
                        value: textValue || "`NOT_EMBED_FIELD_VALUE_FOUND`"
                    },
                    {
                        name: "#️⃣ Canal",
                        value: `${logChannel || "Escolha um canal usando \`/logs config_channel:\`"}`
                    },
                    {
                        name: "📜 Permissões",
                        value: `Eu preciso da permissão **\`${PermissionsTranslate.ViewAuditLog}\`**\nQuem for gerenciar este sistema, precisa da permissão **\`${PermissionsTranslate.ManageGuild}\`**`
                    },
                    {
                        name: `${e.Info} Status`,
                        value: `${e.Check} Sistema de logs ativado\n${e.Deny} Sistema de logs desativado\n${e.Loading} Sistema de logs em construção\n${e.Warn} Sistema de logs em manutenção`
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

        async function setChannel() {

            if (configChannel.id === guildData?.LogSystem?.channel)
                return await interaction.reply({
                    content: `${e.Deny} | Este já é o canal do configurado no sistema GSN.`,
                    ephemeral: true
                })

            if (!configChannel.id)
                return await interaction.reply({
                    content: `${e.Deny} | Canal não encontrado.`,
                    ephemeral: true
                })

            if (![0, 5].includes(configChannel.type))
                return await interaction.reply({
                    content: `${e.Deny} | Apenas canais de textos e anúncios podem ser configurados no sistema GSN.`,
                    ephemeral: true
                })

            return Database.Guild.updateOne(
                { id: guild.id },
                {
                    $set: {
                        "LogSystem.channel": configChannel.id
                    }
                }
            )
                .then(async result => {

                    if (result.modifiedCount > 0)
                        return await interaction.reply({
                            content: `${e.Check} | O canal ${configChannel} foi configurado com sucesso como o canal pai do sistema GSN neste servidor.`
                        })

                    return await interaction.reply({
                        content: `${e.Warn} | Não foi possível configurar este canal no banco de dados.`,
                        ephemeral: true
                    })
                })
                .catch(async err => await interaction.reply({
                    content: `${e.Warn} | Não foi possível configurar este canal no banco de dados.\n> \`${err}\``
                }))

        }

    }
}