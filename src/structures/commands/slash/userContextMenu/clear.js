import { DiscordPermissons, Permissions } from '../../../../util/Constants.js'

export default {
    name: 'Clear 50 Messages',
    dm_permission: false,
    name_localizations: { 'pt-BR': 'Limpar 50 Mensagens' },
    default_member_permissions: Permissions.ManageMessages,
    category: "context menu",
    type: 3,
    api_data: {
        name: "Clear 50 Messages",
        description: "Limpe 50 mensagens rapidamente clicando em Mensagens -> Apps",
        category: "Moderação",
        synonyms: ["Limpar 50 Mensagens"],
        tags: [],
        perms: {
            user: [DiscordPermissons.ManageMessages],
            bot: [DiscordPermissons.ManageMessages]
        }
    },
    async execute({ interaction, e, config }) {

        const { targetMessage, channel } = interaction
        const user = targetMessage.author
        const messagesFetched = await channel.messages.fetch({ limit: 50 }).catch(() => null)

        if (!messagesFetched)
            return interaction.reply({
                content: `${e.Deny} | Eu não achei nenhuma mensagem para deletar ou eu não tenho permissão o suficiente.`,
                ephemeral: true
            })

        const toDelete = messagesFetched.filter(msg => !msg.system && msg.author?.id === user.id)

        if (!toDelete || !toDelete.size)
            return interaction.reply({
                content: `${e.Deny} | Eu não achei nenhuma mensagem do usuário ${user}.`,
                ephemeral: true
            })

        const messagesDeleted = await channel.bulkDelete(toDelete.filter(msg => !msg.pinned), true).catch(err => err.code)

        if (messagesDeleted.constructor === Number) {

            const content = {
                10008: `${e.Warn} | Alguma das mensagens acima é desconhecida ou o Discord está com lag.`,
                50013: `${e.Deny} | Eu não tenho a permissão **\`Gerenciar Mensagens\`** para executar este comando.`,
                50034: `${e.Warn} | As mensagens acima são velhas demais para eu apagar.`
            }[messagesDeleted] || `${e.Deny} | Aconteceu um erro ao executar este comando, caso não saiba resolver, reporte o problema com o comando \`/bug\` ou entre no [meu servidor](${config.MoonServerLink}).\n\`${err}\`\n\`(${messagesDeleted})\``

            return interaction.reply({ content, ephemeral: true })
        }

        const pinnedMessagesCount = toDelete.filter(msg => msg.pinned).size || 0
        const oldMessagesCount = toDelete.filter(msg => !Date.Timeout(((1000 * 60 * 60) * 24) * 14, msg.createdAt.valueOf())).size || 0
        const deletedMessagesCount = messagesDeleted.size || 0
        const availableMessagesFilterCount = toDelete.size || 0

        if (!deletedMessagesCount || deletedMessagesCount === 0)
            return interaction.reply({
                content: `${e.Info} | ${toDelete.size === 1 ? `A única mensagem encontrada de ${user || '`Not Found`'} não pode ser delatada.` : `Nenhuma das ${toDelete.size} mensagens de ${user || '`Not Found`'} podem ser deletadas.`}${pinnedMessagesCount > 0 ? `\n📌 | ${pinnedMessagesCount} mensagens fixadas.` : ''}${oldMessagesCount > 0 ? `\n📆 | ${oldMessagesCount} mensagens são mais antigas que 14 dias.` : ''}`,
                ephemeral: true
            })

        return interaction.reply({
            content: `${e.Check} | Nas últimas ${messagesFetched.size} mensagens eu achei ${availableMessagesFilterCount} mensagens de ${user || '`Not Found`'}.\n${messagesDeleted.size === 1 ? `${e.Trash} | 1 Mensagem deletada.` : `${e.Trash} | ${messagesDeleted.size} mensagens deletadas.`}${pinnedMessagesCount > 0 ? `\n📌 | ${pinnedMessagesCount} mensagens fixadas não foram apagadas.` : ''}${oldMessagesCount > 0 ? `\n📆 | ${oldMessagesCount} mensagens não foram apagadas por serem mais antigas que 14 dias.` : ''}`
        })
    }
}