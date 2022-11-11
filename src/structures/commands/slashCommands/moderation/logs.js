import { Colors, Permissions } from "../../../../util/Constants.js";
import { Database } from "../../../../classes/index.js"
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
    async execute({ interaction, e }) {

        const { guild, options } = interaction
        const configChannel = options.getChannel('config_channel') || null
        const guildData = await Database.Guild.findOne({ id: guild.id }, "LogSystem")

        if (configChannel) return setChannel()

        const logChannel = guild.channels.cache.get(guildData?.LogSystem?.channel) || `Escolha um canal usando \`/logs config_channel:\``
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
            const emoji = key.active ? "🟢" : e.Loading
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
                        value: `${textValue}`
                    },
                    {
                        name: "#️⃣ Canal",
                        value: `${logChannel}`
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