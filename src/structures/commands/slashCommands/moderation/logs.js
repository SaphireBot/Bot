import { Colors, DiscordPermissons, Permissions, PermissionsTranslate } from "../../../../util/Constants.js";
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import notify from "../../../../functions/plugins/notify.js";

export default {
    name: 'logs',
    description: '[moderation] Gerencie os meus sistemas de logs por aqui',
    category: "moderation",
    dm_permission: false,
    default_member_permissions: `${PermissionFlagsBits.ManageGuild}`,
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
    async execute({ interaction, e, Database, client, guildData }) {

        const { guild, options, commandId, user, member } = interaction

        if (!guild.clientHasPermission(Permissions.ViewAuditLog) || !guild.clientHasPermission(Permissions.ManageWebhooks))
            return await interaction.reply({
                content: `${e.Deny} | Eu preciso da permissão **\`${PermissionsTranslate.ViewAuditLog}\`** e **\`${PermissionsTranslate.ManageWebhooks}\`** para executar este comando.`,
                ephemeral: true
            })

        if (!member.permissions.has(DiscordPermissons.ManageGuild, true))
            return await interaction.reply({
                content: `${e.Deny} | Você precisa da permissão **${PermissionsTranslate.ManageGuild}** para executar este comando.`,
                ephemeral: true
            })

        const configChannel = options.getChannel('config_channel') || null

        if (configChannel) return setChannel()

        const logChannel = await guild.channels.fetch(guildData?.LogSystem?.channel || '0').catch(() => null)

        if (!logChannel)
            return await interaction.reply({
                content: `${e.Deny} | Você precisa escolher um canal usando \`/logs config_channel:\` antes de acessar este comando.`,
                ephemeral: true
            })

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
                ? e.CheckV
                : key.name.includes("_")
                    ? e.Loading
                    : e.DenyX

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

            const webhookFetch = await configChannel.fetchWebhooks().catch(() => null)

            const webhook = webhookFetch?.find(w => w?.name === "Global System Notification")
                || await configChannel.createWebhook({
                    name: "Global System Notification",
                    avatar: process.env.WEBHOOK_GSN_AVATAR,
                    reason: 'Webhook Notification GSN'
                }).catch(err => err)

            if (!webhook?.url)
                return await interaction.reply({
                    content: `${e.Deny} | Não foi possível criar a webhook necessária.`
                })

            return Database.Guild.updateOne(
                { id: guild.id },
                {
                    $set: {
                        "LogSystem.channel": configChannel.id,
                        "LogSystem.webhookUrl": webhook.url
                    }
                }
            )
                .then(async result => {

                    if (result.modifiedCount > 0) {
                        notify(configChannel.id, 'Log System Enabled', `${user} \`${user.id}\` ativou o sistema de logs.`)

                        client.sendWebhook(
                            webhook.url,
                            {
                                username: "Global System Notification | Central Database",
                                avatarURL: process.env.WEBHOOK_GSN_AVATAR,
                                content: `${user} \`${user.id}\`, este canal foi registrado e aceito com sucesso no Sistema Global de Notificações da ${client.user.username}.\nTodos os recursos e informações que ligam este servidor ou quaisquer membros com a ${client.user.username} será notificado por está Webhook neste canal.\n \n*Atenciosamente: Equipe Administrativa de Desenvolvimento do Projeto Saphire.*`
                            }
                        )

                        return await interaction.reply({
                            content: `${e.Check} | O canal ${configChannel} foi configurado com sucesso como o canal pai do sistema GSN neste servidor.\n${e.Info} | Com um canal configurado, você pode usar o comando </logs:${commandId}> para configurar quais logs você quer receber.`
                        })
                    }

                    return await interaction.reply({
                        content: `${e.Warn} | Não foi possível configurar este canal no banco de dados.`,
                        ephemeral: true
                    })
                })
                .catch(async err => await interaction.reply({
                    content: `${e.Warn} | Não foi possível configurar este canal no banco de dados.\n${e.bug} | \`${err}\``
                }))

        }

    }
}