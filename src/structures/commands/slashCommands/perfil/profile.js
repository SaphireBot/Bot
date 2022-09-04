import { ApplicationCommandOptionType, ButtonStyle } from 'discord.js'
import { Config as config } from '../../../../util/Constants.js'
import refreshProfile from './perfil/refresh.profile.js'

export default {
    name: 'perfil',
    description: '[perfil] Configura o seu perfil ou o de alguém',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'user',
            description: 'Veja o perfil de alguém',
            type: ApplicationCommandOptionType.User
        },
        {
            name: 'options',
            description: 'Mais opções do sistema de perfil',
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'Atualizar perfil',
                    value: 'refresh'
                },
                // {
                //     name: 'Editar perfil',
                //     value: 'edit'
                // },
                {
                    name: 'Esconder só pra mim',
                    value: 'hide'
                }
            ]
        }
    ],
    helpData: {
        description: 'Informações no perfil privado dentro do meu sistema',
        permissions: [],
        fields: []
    },
    async execute({ interaction, client, emojis: e, Database, Moeda, clientData }) {

        const { options, user: author, channel, guild } = interaction
        const query = options.getString('options')
        const ephemeral = query === 'hide'

        if (query === 'refresh') return refreshProfile(interaction)

        const user = options.getUser('user') || author

        if (user.id === client.user.id)
            return await interaction.reply({
                embeds: [{
                    color: client.blue,
                    description: `${e.VipStar} **Perfil Pessoal de ${client.user.username}**`,
                    thumbnail: { url: user.displayAvatarURL({ dynamic: true }) },
                    fields: [
                        {
                            name: `👤 Pessoal`,
                            value: `🔰 Princesa do Discord\n${e.Deny} Não tenho signo\n:tada: 29/4/2021\n${e.CatJump} Gatinha\n👷 Bot no Discord`
                        },
                        {
                            name: '🌟 Títulos',
                            value: `${e.SaphireTimida} **Envergonhada**\n🎃 **Halloween 2021**\n${e.Star}${e.Star}${e.Star}${e.Star}${e.Star}${e.Star}`
                        },
                        {
                            name: '💍 Cônjuge',
                            value: `💍 Itachi Uchiha`
                        },
                        {
                            name: '❤️ Família',
                            value: `${client.users.resolve(Database.Names.Rody)?.tag || 'Indefnido'}`
                        },
                        {
                            name: '🤝 Parças',
                            value: 'Galera do Discord'
                        },
                        {
                            name: '🌐 Global',
                            value: `∞ ${Moeda}\n∞ ${e.RedStar} Level\n∞ ${e.Like} Likes`,
                        },
                        {
                            name: '📝 Status',
                            value: 'Um dia eu quero ir a lua'
                        },
                        {
                            name: '🛡️ Clan',
                            value: 'Saphire\'s Team Official'
                        }
                    ]
                }],
                ephemeral
            })

        if (user.bot)
            return await interaction.reply({
                content: `${e.Deny} | Bots não possuem perfil.`,
                ephemeral
            })

        const data = await Database.User.findOne({ id: user.id })

        if (!data)
            return await interaction.reply({
                content: `${e.Database} | DATABASE | Nenhum dado encontrado de ${user?.tag || `\`Not Found\``} *\`${user.id}\`* foi encontrado.`,
                ephemeral
            })

        if (!data.Perfil)
            return await interaction.reply({
                content: `${e.Deny} | Nenhuma informação do perfil foi encontrada.`,
                ephemeral
            })

        const Embed = { color: client.blue, description: `${e.Loading} | Construindo perfil...` }

        await interaction.reply({ embeds: [Embed], ephemeral })

        const money = data.Perfil.BalanceOcult && (author.id !== user.id || author.id !== config.ownerId)
            ? '||Oculto||'
            : data.Balance?.currency() || 0

        const marry = data?.Perfil.Marry?.Conjugate
            ? await (async () => {
                const u = client.users.resolve(data.Perfil.Marry.Conjugate)?.tag

                if (!u) {

                    await Database.User.updateMany(
                        { id: { $in: [user.id, data.Marry?.Conjugate] } },
                        { $unset: { 'Perfil.Marry': 1 } }
                    )

                    channel.send(`${e.Database} | DATABASE | Eu não achei o usuário setado como seu cônjuge. Efetuei a separação.`)
                    return `${e.Deny} Usuário deletado`
                }

                const time = data?.Perfil.Marry?.StartAt
                return `${u} | ${Date.Timestamp(new Date(time), 'R', true)}`
            })()
            : "Solteiro(a)"
        const level = data?.Level || 0
        const likes = data?.Likes || 0
        const vip = await user.isVip() ? `${e.VipStar}` : '📃'
        const estrela = 'Indefinido'
        const titles = []

        if (clientData.Administradores?.includes(user.id))
            titles.push(`${e.Admin} **Official Administrator**`)

        if (clientData.Moderadores?.includes(user.id))
            titles.push(`${e.ModShield} **Official Moderator**`)

        if (clientData.Titles?.Developer?.includes(user.id))
            titles.push(`${e.OwnerCrow} **Official Developer**`)

        if (clientData.Titles?.BugHunter?.includes(user.id))
            titles.push(`${e.Gear} **Bug Hunter**`)

        if (clientData.Titles?.OfficialDesigner?.includes(user.id))
            titles.push(`${e.SaphireFeliz} **Designer Official**`)

        if (clientData.Titles?.Halloween?.includes(user.id))
            titles.push("🎃 **Halloween 2021**")

        const Titulo = data.Perfil?.Titulo || `Sem título definido \`/perfil options: Editar perfil\``
        const titulo = data.Perfil?.TitlePerm ? `🔰 ${Titulo}` : `${e.Deny} Não possui título`

        const Estrelas = {
            Um: data.Perfil.Estrela?.Um,
            Dois: data.Perfil.Estrela?.Dois,
            Tres: data.Perfil.Estrela?.Tres,
            Quatro: data.Perfil.Estrela?.Quatro,
            Cinco: data.Perfil.Estrela?.Cinco,
            Seis: data.Perfil.Estrela?.Seis,
        }

        let stars = `${e.GrayStar}${e.GrayStar}${e.GrayStar}${e.GrayStar}${e.GrayStar}`
        if (Estrelas.Um) stars = `${e.Star}${e.GrayStar}${e.GrayStar}${e.GrayStar}${e.GrayStar}`
        if (Estrelas.Dois) stars = `${e.Star}${e.Star}${e.GrayStar}${e.GrayStar}${e.GrayStar}`
        if (Estrelas.Tres) stars = `${e.Star}${e.Star}${e.Star}${e.GrayStar}${e.GrayStar}`
        if (Estrelas.Quatro) stars = `${e.Star}${e.Star}${e.Star}${e.Star}${e.GrayStar}`
        if (Estrelas.Cinco) stars = `${e.Star}${e.Star}${e.Star}${e.Star}${e.Star}`
        if (Estrelas.Seis) stars = `${e.Star}${e.Star}${e.Star}${e.Star}${e.Star}${e.Star}`

        const parcaData = data?.Perfil?.Parcas || []
        const familyData = data?.Perfil?.Family
        const status = data?.Perfil?.Status || `${user.id === author.id ? 'Talvez você não conheça o comando' : `${user.username} não conhece o comando`} \`/perfil options: Editar perfil\``
        const signo = data?.Perfil?.Signo ? `⠀\n${data?.Perfil?.Signo}` : `⠀\n${e.Deny} Sem signo definido`
        const sexo = data?.Perfil?.Sexo ? `⠀\n${data?.Perfil?.Sexo}` : `⠀\n${e.Deny} Sem gênero definido`
        const niver = data?.Perfil?.Aniversario ? `⠀\n🎉 ${data?.Perfil?.Aniversario}` : `⠀\n${e.Deny} Sem aniversário definido`
        const job = data?.Perfil?.Trabalho ? `⠀\n👷 ${data?.Perfil?.Trabalho}` : `⠀\n${e.Deny} Sem profissão definida`
        const Clan = data?.Clan || 'Não possui'
        clientData.TopGlobal?.Level === user.id ? titles.push(`${e.RedStar} **Top Global Level**`) : ''
        clientData.TopGlobal?.Likes === user.id ? titles.push(`${e.Like} **Top Global Likes**`) : ''
        clientData.TopGlobal?.Money === user.id ? titles.push(`${e.MoneyWings} **Top Global Money**`) : ''
        clientData.TopGlobal?.Quiz === user.id ? titles.push(`🧠 **Top Global Quiz**`) : ''
        clientData.TopGlobal?.Mix === user.id ? titles.push(`🔡 **Top Global Mix**`) : ''
        clientData.TopGlobal?.Jokempo === user.id ? titles.push(`✂️ **Top Global Jokempo**`) : ''
        clientData.TopGlobal?.TicTacToe === user.id ? titles.push(`#️⃣ **Top Global TicTacToe**`) : ''
        clientData.TopGlobal?.Memory === user.id ? titles.push(`${e.duvida || '❔'} **Top Global Memory**`) : ''
        clientData.TopGlobal?.Forca === user.id ? titles.push(`😵 **Top Global Forca**`) : ''
        clientData.TopGlobal?.Flag === user.id ? titles.push(`🎌 **Top Global Flag Gaming**`) : ''

        const parcas = parcaData.length > 0
            ? (() => {
                const data = parcaData.map(id => {
                    if (!id) return null

                    let u = client.users.resolve(id)
                    if (!u) return 'REFRESH--'
                    return u.tag.replace(/`/g, '')
                }).join('\n')

                if (data.includes('REFRESH--'))
                    return 'Este perfil precisa ser atualizado. \`/perfil options: Atualizar perfil\`'

                return data
            })()
            : 'Nenhum parça'

        const family = familyData.length > 0
            ? (() => {

                const data = familyData.map(id => {
                    if (!id) return null

                    let u = client.users.resolve(id)
                    if (!u) return 'REFRESH--'
                    return u.tag.replace(/`/g, '')
                }).join('\n')

                if (data.includes('REFRESH--'))
                    return 'Este perfil precisa ser atualizado. \`/perfil options: Atualizar perfil\`'

                return data
            })()
            : 'Nenhum membro na família'

        Embed.title = `${vip} ${user.id === author.id ? 'Seu perfil' : `Perfil de ${user.username}`}`
        Embed.description = null
        Embed.thumbnail = { url: user.displayAvatarURL({ dynamic: true }) }
        Embed.fields = [
            {
                name: '👤 Pessoal ' + stars,
                value: `${titulo}${signo}${niver}${sexo}${job}`
            },
            {
                name: '🌟 Títulos',
                value: titles.join('\n') || 'Nenhum título por aqui'
            },
            {
                name: '💍 Cônjuge',
                value: marry
            },
            {
                name: '❤️ Família',
                value: family
            },
            {
                name: '🤝 Parças',
                value: parcas
            },
            {
                name: '🌐 Global',
                value: `${money} ${Moeda}\n${level} ${e.RedStar} Level`,
            },
            {
                name: '📝 Status',
                value: status
            },
            {
                name: '🛡️ Clan',
                value: Clan
            }
        ]

        const warnData = await Database.Guild.findOne({ id: guild.id }, 'Warns.Users')
        const warnsFormat = warnData?.Warns?.Users || {}
        const warns = Object.values(warnsFormat[`${user.id}`] || {})

        if (warns.length > 0)
            Embed.footer = { text: `${warns.length} avisos neste servidor` }

        const buttons = [{ type: 1, components: [] }]

        if (ephemeral && user.id !== author.id)
            buttons[0].components.push({
                type: 2,
                label: `${likes} likes`,
                emoji: e.Like,
                custom_id: JSON.stringify({ c: 'like', src: user.id }),
                style: ButtonStyle.Primary
            })

        if (author.id === user.id)
            buttons[0].components.push({
                type: 2,
                label: 'Editar Perfil',
                emoji: '📝',
                custom_id: 'editProfile',
                style: ButtonStyle.Success,
                disabled: true
            })

        await interaction.editReply({ embeds: [Embed], components: buttons[0].components.length > 0 ? buttons : [] }).catch(() => { })

    }
}