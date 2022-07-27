import { Permissions } from '../../../../util/Constants.js'

export default {
    name: 'Clear 50 Messages',
    dm_permission: false,
    default_member_permissions: Permissions.ManageMessages,
    type: 3,
    async execute({ interaction: interaction, emojis: e, config: config }) {

        const { targetMessage } = interaction

        const user = targetMessage.author
        const MsgsPraDeletar = await targetMessage.channel.messages.fetch({ limit: 50 })
        const userFilter = MsgsPraDeletar.filter(msg => msg.author.id === user.id && !msg.pinned)

        return targetMessage.channel.bulkDelete(userFilter)
            .then(async messagesDeleted => {
                return await interaction.reply({
                    content: `${e.Check} | Nas últimas ${MsgsPraDeletar.size} mensagens, eu achei ${messagesDeleted.size} mensagens de ${user} e apaguei elas sob as ordens de ${interaction.user}.\n*> Eu não apago mensagens fixadas ou acima de 14 dias.*`
                })
            }).catch(async err => {

                if (err.code === 10008)
                    return await interaction.reply({
                        content: `${e.Warn} | Alguma das mensagens acima é desconhecida ou o Discord está com lag.`
                    })

                if (err.code === 50034)
                    return await interaction.reply({
                        content: `${e.Warn} | As mensagens acima são velhas demais para eu apagar.`
                    })

                return await interaction.reply({
                    content: `${e.Deny} | Aconteceu um erro ao executar este comando, caso não saiba resolver, reporte o problema com o comando \`/bug\` ou entre no [meu servidor](${config.SupportServerLink}).\n\`${err}\``
                })
            })
    }
}