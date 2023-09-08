export default {
    name: 'Avatar',
    dm_permission: false,
    category: "context menu",
    type: 2,
    apiData: {
        name: "Avatar",
        description: "Veja o avatar de alguém clicando no Usário -> Apps",
        category: "Utilidades",
        synonyms: [],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, client, e }) {

        const { targetUser: user, targetMember: member } = interaction
        await user.fetch()
        const userAvatarURL = user.avatarURL({ forceStatic: false, size: 1024 })
        const memberAvatarURL = member?.avatarURL({ forceStatic: false, size: 1024 })
        const userAvatarImage = user.displayAvatarURL({ forceStatic: false, size: 1024 })
        const memberAvatarImage = member?.displayAvatarURL({ forceStatic: false, size: 1024 })
        const banner =  user.bannerURL({ size: 2048 })
        const embeds = [
            {
                color: client.blue,
                description: `${e.Download} [Clique aqui](${userAvatarURL}) para baixar o avatar original de ${user.username}`,
                image: { url: userAvatarImage }
            }
        ]

        if (memberAvatarImage && userAvatarImage !== memberAvatarImage)
            embeds.push({
                color: client.blue,
                description: `${e.Download} [Clique aqui](${memberAvatarURL}) para baixar o avatar no servidor de ${user?.username || 'NomeDesconhecido'}`,
                image: { url: memberAvatarImage }
            })

        if (banner)
            embeds.push({
                color: client.blue,
                description: `${e.Download} [Clique aqui](${banner}) para baixar o banner de ${user?.username || 'NomeDesconhecido'}`,
                image: { url: banner }
            })

        return interaction.reply({ embeds: [...embeds], ephemeral: true })

    }
}