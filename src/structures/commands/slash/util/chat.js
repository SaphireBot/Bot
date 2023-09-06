import { ButtonStyle } from 'discord.js'
import { Database } from '../../../../classes/index.js'
import { Emojis as e } from '../../../../util/util.js'

export default {
    name: 'chat',
    description: '[util] Um simples chat global',
    dm_permission: false,
    type: 1,
    options: [],
    helpData: {
        color: '',
        description: 'Sistema que permite um comunicação global',
        permissions: [],
        fields: []
    },
    apiData: {
        name: "chat",
        description: "Converse com alguém de outros servidores por este comando",
        category: "Utilidades",
        synonyms: [],
        perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, client }) {

        const fields = await getMessagesAndFormat() || []

        if (!fields || !fields.length)
            return await interaction.reply({
                content: `${e.Deny} | Não tem nenhum mensagem global por enquanto.`,
                components: [{
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: "Enviar uma mensagem",
                            custom_id: JSON.stringify({ c: "chat", src: "send" }),
                            style: ButtonStyle.Primary
                        }
                    ]
                }],
                ephemeral: true
            })

        await interaction.reply({
            embeds: [
                {
                    color: client.blue,
                    title: `📨 ${client.user.username}'s Global Chat`,
                    description: "Neste comando aparece apenas as últimas 9 mensagens globais.\nAs mensagens são atualizadas a cada 5 segundos.\nEste é um recurso beta.",
                    timestamp: new Date()
                },
                ...fields
            ],
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: "Enviar uma mensagem",
                        custom_id: JSON.stringify({ c: "chat", src: "send" }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: "Desativar chat",
                        custom_id: JSON.stringify({ c: "delete" }),
                        style: ButtonStyle.Danger
                    },
                    {
                        type: 2,
                        emoji: "🔄",
                        custom_id: JSON.stringify({ c: "chat", src: "refresh" }),
                        style: ButtonStyle.Primary
                    }
                ]
            }]
        })
            .then(() => refreshing())
            .catch(() => null)

        async function refreshing() {

            const interval = setInterval(async () => {
                const fields = await getMessagesAndFormat() || []
                if (!fields.length) return

                return await interaction.editReply({
                    embeds: [
                        {
                            color: client.blue,
                            title: `📨 ${client.user.username}'s Global Chat`,
                            description: "Neste comando aparece apenas as últimas 9 mensagens globais.\nAs mensagens são atualizadas a cada 5 segundos.\nEste é um recurso beta.",
                            timestamp: new Date()
                        },
                        ...fields
                    ]
                })
                    .catch(() => clearInterval(interval))

            }, 5000)

            return
        }

        async function getMessagesAndFormat() {

            const data = await Database.Cache.Chat.get("Global") || []
            const messages = data.slice(-9)

            let fields = []

            if (messages) {

                fields = messages.map(data => ({
                    color: client.blue,
                    author: {
                        name: `${data.userTag} [${data.userId}]`,
                        icon_url: data.userAvatar || null
                    },
                    description: data.content || "Nothing Here",
                    footer: {
                        text: `${data.guildName} - ${data.guildId}`,
                        icon_url: data.guildAvatar || null
                    }
                }))

                if (fields.length > 9)
                    fields.length = 9
            }

            return fields
        }
    }
}