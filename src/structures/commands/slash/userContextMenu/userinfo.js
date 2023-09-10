import { DiscordFlags as flags, PermissionsTranslate, Permissions, DiscordPermissons } from '../../../../util/Constants.js'
import { ButtonStyle } from 'discord.js'

export default {
    name: 'User Info',
    dm_permission: false,
    category: "context menu",
    type: 2,
    helpData: {
        color: 'Blue',
        description: 'Clique em alguém e veja suas informações de maneira simples e prática',
        permissions: [],
        fields: []
    },
    api_data: {
        name: "User Info",
        description: "Veja rapidamente os dados de um Usuário -> Apps",
        category: "Utilidades",
        synonyms: [],
        tags: [],
        perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, client, e }) {

        const { targetUser: user, targetMember: member, user: author, guild } = interaction
        const components = []
        const userData = {}
        const memberData = {}
        const userflags = user?.flags?.toArray() || []

        if (user.bot && !userflags.includes('VerifiedBot')) userflags.push('Bot')
        userData.Bandeiras = userflags.length > 0
            ? userflags
                .filter(i => isNaN(i))
                .map(flag => e[flag] || flags[flag] || `\`${flag}\``)
                .join(' ') || 'Nenhuma'
            : 'Nenhuma'
        userData.system = user.system ? '\n🧑‍💼 `\`Usuário do Sistema\``' : ''
        userData.avatar = user.avatarURL({ forceStatic: false, format: "png", size: 1024 })
        userData.bot = user.bot ? '\`Sim\`' : '\`Não\`'
        userData.createAccount = Date.Timestamp(user.createdAt, 'F', true)
        userData.timeoutAccount = Date.Timestamp(user.createdAt, 'R', true)

        if (member) {
            memberData.joinedAt = Date.Timestamp(member.joinedAt, 'F', true)
            memberData.joinedTimestamp = Date.Timestamp(member.joinedAt, 'R', true)
            memberData.onwer = guild.ownerId === user.id ? '\`Sim\`' : '\`Não\`'
            memberData.adm = member.permissions.toArray().includes(DiscordPermissons.Administrator) ? '\`Sim\`' : '\`Não\`'
            memberData.associado = member.pending ? '\`Não\`' : '\`Sim\`'
            memberData.premiumSince = member.premiumSinceTimestamp ? `\n${e.Boost} Booster ${Date.Timestamp(member.premiumSince, 'R', true)}` : ''
            memberData.roles = member.roles.cache.filter(r => r.name !== '@everyone').map(r => `\`${r.name}\``).join(', ') || '\`Nenhum cargo\`'
            memberData.permissions = (() => {
                if (user.id === guild.ownerId) return `${user.username} é o dono*(a)* do servidor. Possui todas as permissões.`
                return member.permissions.toArray().map(perm => `\`${PermissionsTranslate[perm] || perm}\``).join(', ')
            })()
        }

        const colorData = client.blue
        const whoIs = user.id === author.id ? 'Suas Informações' : `Informações de ${user.username}`

        const embeds = [
            {
                color: colorData,
                title: `${e.Info} ${whoIs}`,
                description: `Resultado: ${member ? user : user.username}`,
                fields: [
                    {
                        name: '👤 Usuário',
                        value: `✏️ Nome: ${user.username} | \`${user.id}\`\n🤖 Bot: ${userData.bot}\n🏳️ Bandeiras: ${userData.Bandeiras}${userData.system}\n📆 Criou a conta em ${userData.createAccount}\n⏱️ Conta criada ${userData.timeoutAccount}`
                    }
                ],
                thumbnail: { url: userData.avatar }
            },
            {
                color: colorData,
                title: `${e.Info} ${guild.name} | ${whoIs}`,
                fields: [
                    {
                        name: '🔰 Servidor',
                        value: `✏️ Nome no servidor: ${member?.displayName || user.username}\n${e.OwnerCrow} Dono: ${memberData?.onwer || 'Não'}\n${e.ModShield} Administrador: ${memberData?.adm || 'Não'}\n🎨 Cor: \`${member?.displayHexColor || "#000000"}\`\n🤝 Associado: ${memberData?.associado || "Não"}${memberData?.premiumSince || ''}\n📅 Entrada: ${memberData?.joinedAt || 'Membro saiu do servidor'}\n⏱️ Membro ${memberData?.joinedTimestamp || 'à 0 Segundos'}`
                    },
                    {
                        name: '@ Cargos',
                        value: memberData?.roles?.limit('MessageEmbedFieldValue') || "Não há nada por aqui"
                    }
                ]
            },
            {
                color: colorData,
                title: `${e.Info} ${whoIs}`,
                fields: [
                    {
                        name: '⚙️ Permissões',
                        value: `${memberData?.permissions || "Nenhuma"}`
                    }
                ]
            }
        ]

        let application = null

        if (guild.clientHasPermission(Permissions.ManageGuild)) {
            const integrations = await guild.fetchIntegrations() || []
            application = integrations.find(data => data.application.id === user.id)?.application
        }

        if (application) {
            const embed = { color: client.blue, title: `🤖 Informações da Integração` }

            embed.description = application.description || null
            embeds.push(embed)
            components.push({
                type: 1,
                components: [{
                    type: 2,
                    label: 'ADICIONAR BOT',
                    emoji: '🔗',
                    url: `https://discord.com/oauth2/authorize?client_id=${application.id}&scope=bot%20applications.commands&permissions=2146958847`,
                    style: ButtonStyle.Link
                }]
            })
        }

        return await interaction.reply({ embeds: embeds, ephemeral: true, components: components })



    }
}