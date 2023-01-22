import { ApplicationCommandOptionType, PermissionsBitField } from 'discord.js'
import { Permissions, DiscordPermissons, PermissionsTranslate } from '../../../../util/Constants.js'

export default {
    name: 'clear',
    description: '[moderation] Limpe mensagens rapidamente no chat',
    dm_permission: false,
    default_member_permissions: `${PermissionsBitField.Flags.ManageMessages}`,
    type: 1,
    name_localizations: { "en-US": "clear", 'pt-BR': 'limpar' },
    database: false,
    options: [
        {
            name: 'user',
            description: '[moderation] Limpe mensagens de um usuário',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    type: ApplicationCommandOptionType.User,
                    description: 'Usuário a ter mensagens deletadas',
                    required: true
                },
                {
                    name: 'amount',
                    type: ApplicationCommandOptionType.Integer,
                    description: 'Quantidade de mensagens a ser deletadas (1~100)',
                    min_value: 1,
                    max_value: 100,
                    required: true
                }
            ]
        },
        {
            name: 'messages',
            description: '[moderation] Limpe mensagens no chat',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'amount',
                    type: ApplicationCommandOptionType.Integer,
                    description: 'Quantidade de mensagens a ser apagadas',
                    min_value: 1,
                    max_value: 100,
                    required: true
                }
            ]
        }
    ],
    helpData: {
        description: 'Limpe rapidamente as mensagens',
        permissions: [DiscordPermissons.ManageMessages],
    },
    async execute({ interaction, e }) {

        const { options, channel, guild, member } = interaction

        if (!guild.members.me.permissions.has(DiscordPermissons.ManageMessages))
            return await interaction.reply({
                content: `${e.Deny} | Eu preciso da permissão **${PermissionsTranslate.ManageMessages}** para executar este comando.`,
                ephemeral: true
            })

        if (!member.permissions.has(DiscordPermissons.ManageMessages, true))
            return await interaction.reply({
                content: `${e.Deny} | Você precisa da permissão **${PermissionsTranslate.ManageMessages}** para executar este comando.`,
                ephemeral: true
            })

        const subCommand = options.getSubcommand()
        const amount = options.getInteger('amount')

        if (amount <= 0 || amount > 100)
            return await interaction.reply({
                content: `${e.Deny} | A quantidade de mensagens a ser apagadas tem que estar entre 0 e 100.`,
                ephemeral: true
            })

        return subCommand === "user"
            ? clearUserMessages()
            : clearChatMessages()

        async function clearUserMessages() {

            const messages = await channel.messages.fetch({ limit: 100 })
                .catch(() => null)

            if (!messages)
                return await interaction.reply({
                    content: `${e.Deny} | Não foi possível obter as mensagens deste canal.`,
                    ephemeral: true
                })

            if (!messages.size)
                return await interaction.reply({
                    content: `${e.Deny} | Este canal não possui nenhuma mensagem.`,
                    ephemeral: true
                })

            const user = options.getUser('user')
            const userMessages = messages.filter(msg => msg.author.id === user.id)

            if (!userMessages.size)
                return await interaction.reply({
                    content: `${e.Deny} | Nas últimas ${messages.size} mensagens, eu não achei nenhuma mensagem de ${user?.tag || 'Not Found'}.`,
                    ephemeral: true
                })

            const control = {
                userMessagesSize: userMessages.size || 0,
                pinned: userMessages.sweep(msg => msg.pinned),
                older: userMessages.sweep(msg => !Date.Timeout(((1000 * 60 * 60) * 24) * 14, msg.createdAt.valueOf())),
                undeletable: userMessages.sweep(msg => !msg.deletable),
                messagesToDelete: userMessages.size > amount
                    ? [...userMessages.keys()].slice(0, amount)
                    : userMessages,
                response: ''
            }

            if (!control.messagesToDelete?.length && !control.messagesToDelete?.size)
                return await interaction.reply({
                    content: `${e.Deny} | Nas ${messages.size} últimas mensagens, ${control.userMessagesSize} são de ${user?.tag || 'Not Found'}.\n📌 | ${control.pinned} mensagens são fixadas.\n📆 | ${control.older} mensagens são mais antigas que 14 dias.\n${e.Info} | ${control.undeletable} mensagens são indeletaveis.`,
                    ephemeral: true
                })

            const messagesDeleted = await channel.bulkDelete(control.messagesToDelete, true)
                .catch(err => err.code)

            if (messagesDeleted.constructor === Number) {

                const content = {
                    10008: `${e.Warn} | Alguma das mensagens acima é desconhecida ou o Discord está com lag.`,
                    50013: `${e.Deny} | Eu não tenho a permissão **\`${PermissionsTranslate.ManageMessages}\`** para executar este comando.`,
                    50034: `${e.Warn} | As mensagens acima são velhas demais para eu apagar.`
                }[messagesDeleted] || `${e.Deny} | Aconteceu um erro ao executar este comando, caso não saiba resolver, reporte o problema com o comando \`/bug\` ou entre no [meu servidor](${config.MoonServerLink}).\n\`${err}\`\n\`(${messagesDeleted})\``

                return await interaction.reply({ content, ephemeral: true })
            }

            control.response += `${e.Check} | Nas ${messages.size} últimas mensagens, ${control.userMessagesSize} são de ${user?.tag || 'Not Found'}.`
            control.response += `\n${e.Trash} | ${messagesDeleted?.size || 0} mensagens excluídas.`

            if (control.undeletable)
                control.response += `\n${e.Info} | ${control.undeletable} mensagens não podem ser deletadas por mim.`

            if (control.older)
                control.response += `\n📆 | ${control.older} mensagens são mais velhas que 14 dias.`

            if (control.pinned > 0)
                control.response += `\n📌 | ${control.pinned} mensagens fixadas não foram apagadas.`

            return await interaction.reply({ content: control.response })
        }

        async function clearChatMessages() {

            const messages = await channel.messages.fetch({ limit: amount }).catch(err => {
                console.log(err)
                return null
            })

            if (!messages)
                return await interaction.reply({
                    content: `${e.Deny} | Não foi possível obter as mensagens deste canal.`,
                    ephemeral: true
                })

            if (!messages.size)
                return await interaction.reply({
                    content: `${e.Deny} | Este canal não possui nenhuma mensagem.`,
                    ephemeral: true
                })

            const control = {
                size: messages.size,
                pinned: messages.sweep(msg => msg.pinned),
                older: messages.sweep(msg => !Date.Timeout(((1000 * 60 * 60) * 24) * 14, msg.createdAt.valueOf())),
                undeletable: messages.sweep(msg => !msg.deletable),
                response: '',
            }

            if (!messages.size)
                return await interaction.reply({
                    content: `${e.Deny} | Nas ${control.size} últimas mensagens, esse foi o resultado.\n📌 | ${control.pinned} mensagens são fixadas.\n📆 | ${control.older} mensagens são mais antigas que 14 dias.\n${e.Info} | ${control.undeletable} mensagens são indeletaveis.`,
                    ephemeral: true
                })

            const messagesDeleted = await channel.bulkDelete(messages, true).catch(err => {
                console.log(err)
                return err.code
            })

            if (messagesDeleted.constructor === Number) {

                const content = {
                    10008: `${e.Warn} | Alguma das mensagens acima é desconhecida ou o Discord está com lag.`,
                    50013: `${e.Deny} | Eu não tenho a permissão **\`${PermissionsTranslate.ManageMessages}\`** para executar este comando.`,
                    50034: `${e.Warn} | As mensagens acima são velhas demais para eu apagar.`
                }[messagesDeleted] || `${e.Deny} | Aconteceu um erro ao executar este comando, caso não saiba resolver, reporte o problema com o comando \`/bug\` ou entre no [meu servidor](${config.MoonServerLink}).\n\`${err}\`\n\`(${messagesDeleted})\``

                return await interaction.reply({ content, ephemeral: true })
            }

            control.response += `${e.Check} | Nas ${control.size} últimas mensagens, esse foi o resultado.`
            control.response += `\n${e.Trash} | ${messagesDeleted?.size || 0} mensagens excluídas.`

            if (control.undeletable > 0)
                control.response += `\n${e.Info} | ${control.undeletable} mensagens não podem ser deletadas por mim.`

            if (control.older > 0)
                control.response += `\n📆 | ${control.older} mensagens são mais velhas que 14 dias.`

            if (control.pinned > 0)
                control.response += `\n📌 | ${control.pinned} mensagens fixadas não foram apagadas.`

            return await interaction.reply({ content: control.response })

        }

    }
}