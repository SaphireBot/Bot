import('dotenv/config')

export default {
    name: 'Avatar',
    dm_permission: false,
    category: "context menu",
    type: 2,
    async execute({ interaction, client, e }) {

        const { targetUser: user, targetMember: member } = interaction
        const userAvatarURL = user.avatarURL({ dynamic: true, size: 1024 })
        const memberAvatarURL = member?.avatarURL({ dynamic: true, size: 1024 })
        const userAvatarImage = user.displayAvatarURL({ dynamic: true, size: 1024 })
        const memberAvatarImage = member?.displayAvatarURL({ dynamic: true, size: 1024 })
        const banner = await user.banner()
        const embeds = [
            {
                color: client.blue,
                description: `${e.Download} [Clique aqui](${userAvatarURL}) para baixar o avatar original de ${user.tag}`,
                image: { url: userAvatarImage }
            }
        ]

        if (memberAvatarImage && userAvatarImage !== memberAvatarImage)
            embeds.push({
                color: client.blue,
                description: `${e.Download} [Clique aqui](${memberAvatarURL}) para baixar o avatar no servidor de ${user?.tag || 'NomeDesconhecido'}`,
                image: { url: memberAvatarImage }
            })

        if (banner)
            embeds.push({
                color: client.blue,
                description: `${e.Download} [Clique aqui](${banner}) para baixar o banner de ${user?.tag || 'NomeDesconhecido'}`,
                image: { url: banner }
            })

        return interaction.reply({ embeds: [...embeds], ephemeral: true })

    }
}