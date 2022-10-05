import {
    DiscordFlags as flags,
    PermissionsTranslate,
    Permissions
} from '../../../../util/Constants.js'
import { ApplicationCommandOptionType, ButtonStyle, UserPremiumType } from 'discord.js'
import { SaphireClient as client } from '../../../../classes/index.js'

export default {
    name: 'userinfo',
    description: '[util] Obtenha as informações de um usuário',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'member',
            description: 'Selecione um membro para ver suas informações',
            type: ApplicationCommandOptionType.User
        },
        {
            name: 'hide',
            description: 'Oculte as informações só para você',
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'Esconder só pra mim',
                    value: 'hide'
                },
                {
                    name: 'Todos podem ver',
                    value: 'false'
                }
            ]
        },
        {
            name: 'user',
            description: 'Pesquise por um usuário em todos os servidores (que eu estou)',
            type: ApplicationCommandOptionType.String,
            autocomplete: true
        }
    ],
    helpData: {
        color: 'Blue',
        description: 'Clique em alguém e veja suas informações de maneira simples e prática',
        permissions: [],
        fields: []
    },
    async execute({ interaction, e }) {

        const { options, guild, user: author } = interaction
        const searchUser = options.getString('user') || null

        const user = options.getUser('member')
            || await client.users.fetch(searchUser, { force: true })
                .catch(() => author)
            || author

        const member = guild.members.cache.get(user.id) || null
        const hide = options.getString('hide') === 'hide'
        const components = []
        const embeds = []
        const userData = {}
        const memberData = {}
        const colorData = client.blue
        const userflags = user?.flags?.toArray() || []
        const whoIs = user.id === author.id ? 'Suas Informações' : `Informações de ${user.username}`

        userData.Bandeiras = `${userflags.length > 0 ? userflags.map(flag => `\`${flags[flag] ? flags[flag] : flag}\``).join(', ') : 'Nenhuma'}`
        userData.system = user.system ? '\n🧑‍💼 `\`Usuário do Sistema\``' : ''
        userData.avatar = user.avatarURL({ dynamic: true, format: "png", size: 1024 })
        userData.bot = user.bot ? '\`Sim\`' : '\`Não\`'
        userData.createAccount = Date.Timestamp(user.createdAt, 'F', true)
        userData.timeoutAccount = Date.Timestamp(user.createdAt, 'R', true)

        embeds.push({
            color: colorData,
            title: `${e.Info} ${whoIs}`,
            description: `Resultado: ${member ? user : user.username}`,
            fields: [
                {
                    name: '👤 Usuário',
                    value: `✏️ Nome: ${user.tag} | \`${user.id}\`\n🤖 Bot: ${userData.bot}\n🏳️ Bandeiras: ${userData.Bandeiras}${userData.system}\n📆 Criou a conta em ${userData.createAccount}\n⏱️ Conta criada ${userData.timeoutAccount}`.limit('MessageEmbedFieldValue')
                }
            ],
            thumbnail: { url: userData.avatar }
        })

        if (member) {
            memberData.joinedAt = Date.Timestamp(member.joinedAt, 'F', true)
            memberData.joinedTimestamp = Date.Timestamp(member.joinedAt, 'R', true)
            memberData.onwer = (guild.ownerId === user.id) ? '\`Sim\`' : '\`Não\`'
            memberData.adm = member.permissions.toArray().includes('ADMINISTRATOR') ? '\`Sim\`' : '\`Não\`'
            memberData.associado = member.pending ? '\`Não\`' : '\`Sim\`'
            memberData.premiumSince = member.premiumSinceTimestamp ? `\n${e.Boost} Booster ${Date.Timestamp(member.premiumSince, 'R', true)}` : ''
            memberData.roles = member.roles.cache.filter(r => r.name !== '@everyone').map(r => `\`${r.name}\``).join(', ') || '\`Nenhum cargo\`'
            memberData.permissions = (() => {
                if (user.id === guild.ownerId) return `${user.username} é o dono*(a)* do servidor. Possui todas as permissões.`
                return member.permissions.toArray().map(perm => `\`${PermissionsTranslate[perm]}\``).join(', ')
            })()

            embeds.push({
                color: colorData,
                title: `${e.Info} ${guild.name} | ${whoIs}`,
                fields: [
                    {
                        name: '🔰 Servidor',
                        value: `✏️ Nome no servidor: ${member?.displayName}\n${e.OwnerCrow} Dono: ${memberData?.onwer}\n${e.ModShield} Administrador: ${memberData?.adm}\n🎨 Cor: \`${member?.displayHexColor}\`\n🤝 Associado: ${memberData?.associado}${memberData?.premiumSince}\n📅 Entrada: ${memberData?.joinedAt}\n⏱️ Membro ${memberData?.joinedTimestamp}`.limit('MessageEmbedFieldValue')
                    },
                    {
                        name: '@ Cargos',
                        value: memberData?.roles.limit('MessageEmbedFieldValue')
                    }
                ]
            },
                {
                    color: colorData,
                    title: `${e.Info} ${whoIs}`,
                    fields: [
                        {
                            name: '⚙️ Permissões',
                            value: `${memberData?.permissions}`.limit('MessageEmbedFieldValue')
                        }
                    ]
                })
        }

        let application = null

        if (guild.clientHasPermission(Permissions.ManageGuild)) {
            const integrations = await guild.fetchIntegrations() || []
            application = integrations.find(data => data?.application?.id === user?.id)?.application
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

        const buttons = [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Pra cá',
                    emoji: e.saphireLeft,
                    custom_id: 'left',
                    style: ButtonStyle.Primary
                },
                {
                    type: 2,
                    label: 'Pra lá',
                    emoji: e.saphireRight,
                    custom_id: 'right',
                    style: ButtonStyle.Primary
                }
            ]
        }]

        const msg = await interaction.reply({
            embeds: embeds.length > 1 ? [embeds[0]] : embeds,
            ephemeral: hide,
            fetchReply: embeds.length > 1,
            components: embeds.length > 1 ? buttons : []
        })

        if (embeds.length === 1) return

        let index = 0

        return msg.createMessageComponentCollector({
            filter: int => int.user.id === author.id,
            idle: 60000
        })
            .on('collect', async ButtonInteraction => {

                const { customId } = ButtonInteraction

                if (customId === 'right') {
                    index++
                    if (!embeds[index]) index = 0
                }

                if (customId === 'left') {
                    index--
                    if (!embeds[index]) index = embeds.length - 1
                }

                return await ButtonInteraction.update({ embeds: [embeds[index]] })
            })
            .on('end', async () => {

                const embed = embeds[index]

                embed.color = client.red
                embed.footer = { text: 'Tempo esgotado.' }

                return await interaction.editReply({
                    embeds: [embed],
                    components: []
                }).catch(() => { })

            })

    }
}