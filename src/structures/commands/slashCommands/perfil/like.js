import { ApplicationCommandOptionType } from 'discord.js'

export default {
    name: 'like',
    description: '[perfil] De likes e aumente seu status',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'user',
            description: 'Selecione um usuário ou diga o ID',
            type: ApplicationCommandOptionType.User
        },
        {
            name: 'search_user',
            description: 'Pesquise por um usuário atráves do meu sistema',
            type: ApplicationCommandOptionType.String,
            autocomplete: true
        }
    ],
    async execute({ interaction, client, emojis: e, Database }) {

        const { options, user: author } = interaction
        const searchId = options.getString('search_user')
        let user = options.getUser('user')

        if (!user && !searchId)
            return await interaction.reply({
                content: `${e.Deny} | Pelo menos um usuário deve ser mencionado.`,
                ephemeral: true
            })

        if (!user && searchId) {
            user = await client.users.fetch(searchId, { force: true })
                .catch(() => null)
        }

        if (!user)
            return await interaction.reply({
                content: `${e.Deny} | Usuário não encontrado.`,
                ephemeral: true
            })

        if (user.id === client.user.id)
            return await interaction.reply({
                content: `Olha, parabéns pelo seu bom gosto, mas assim... Eu não preciso de likes não.`,
                ephemeral: true
            })

        if (user.id === author.id || user.bot)
            return await interaction.reply({
                content: `${e.Like} | Você não pode dar like para você mesmo e nem para bots, sabia?`,
                ephemeral: true
            })

        const dbData = await Database.User.find({ id: { $in: [author.id, user?.id] } }, 'id Timeouts.Rep Likes')
        const data = {}
        const authorData = dbData.find(d => d.id === author.id)

        if (!authorData)
            return await interaction.reply({
                content: `${e.Database} | Nenhum dado seu foi encontrado. Acabei de efetuar o registro. Por favor, use o comando novamente.`,
                ephemeral: true
            })

        data.timeout = authorData?.Timeouts?.Rep

        if (Date.Timeout(1800000, data.timeout))
            return await interaction.reply({
                content: `${e.Nagatoro} | Calminha aí Princesa! Outro like só ${Date.Timestamp(new Date(data.timeout + 1800000), 'R', true)}`,
                ephemeral: true
            })

        const uData = dbData.find(d => d.id === user?.id)

        if (!uData) {
            Database.registerUser(user)
            return await interaction.reply({
                content: `${e.Database} | Eu não encontrei **${user.tag} *\`${user.id}\`***. Acabei de efetuar o registro. Por favor, use o comando novamente.`,
                ephemeral: true
            })
        }

        data.userLikes = uData?.Likes || 0
        Database.addItem(user.id, 'Likes', 1)
        Database.SetTimeout(author.id, 'Timeouts.Rep')

        return await interaction.reply({
            content: `${e.Check} | Você deu um like para ${user.username}. Agora, ${user.username} tem ${e.Like} ${data.userLikes + 1} likes.`
        })

    }
}