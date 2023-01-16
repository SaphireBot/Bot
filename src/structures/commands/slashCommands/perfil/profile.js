import { ApplicationCommandOptionType, RouteBases, Routes } from 'discord.js'
import { Config as config } from '../../../../util/Constants.js'
import Modals from '../../../classes/Modals.js'
import refreshProfile from './perfil/refresh.profile.js'
import signProfile from './perfil/sign.profile.js'
import genderProfile from './perfil/gender.profile.js'
import axios from 'axios'
import { Emojis as e } from '../../../../util/util.js'

export default {
    name: 'perfil',
    description: '[perfil] Configura o seu perfil ou o de alguém',
    category: "perfil",
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
                {
                    name: 'Editar perfil',
                    value: 'edit'
                },
                {
                    name: 'Escolher signo',
                    value: 'signo'
                },
                {
                    name: 'Escolher sexo',
                    value: 'gender'
                },
                {
                    name: 'Esconder mensagem só pra mim',
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
    async execute({ interaction, client, Database, Moeda, clientData, refresh, guildData }) {

        const { options, user: author, channel } = interaction
        const query = refresh ? null : options.getString('options')
        const ephemeral = query === 'hide'

        if (query === 'refresh') return refreshProfile(interaction)
        if (query === 'edit') return showModal()
        if (query === 'signo') return signProfile(interaction)
        if (query === 'gender') return genderProfile(interaction)

        const user = refresh ? author : options.getUser('user') || author

        if (!user)
            await interaction.reply({
                content: `${e.Deny} | Nenhum usuário encontrado.`,
                ephemeral: true
            })

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
                        }
                    ]
                }],
                ephemeral
            })

        if (user.bot)
            return await interaction.reply({
                content: `${e.Deny} | Bots não possuem perfil.`,
                ephemeral: true
            })

        const data = await Database.User.findOne({ id: user.id })

        if (!data) {
            const res = {
                content: `${e.Database} | DATABASE | Nenhum dado encontrado de ${user?.tag || `\`Not Found\``} *\`${user.id}\`* foi encontrado.`,
                ephemeral,
                components: []
            }

            return refresh
                ? await interaction.update(res).catch(() => { })
                : await interaction.reply(res)
        }

        if (!data.Perfil) {
            const res = {
                content: `${e.Deny} | Nenhuma informação do perfil foi encontrada.`,
                ephemeral,
                components: []
            }

            return refresh
                ? await interaction.update(res).catch(() => { })
                : await interaction.reply(res)
        }
        const Embed = { color: client.blue, description: `${e.Loading} | Construindo perfil...` }

        refresh
            ? await interaction.update({ embeds: [Embed], ephemeral, components: [] }).catch(() => { })
            : await interaction.reply({ embeds: [Embed], ephemeral, components: [] })

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

        const titulo = data.Perfil?.Titulo ? `🔰 ${data.Perfil?.Titulo}` : `${e.Deny} Sem título definido`

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
        const sexo = data?.Perfil?.Sexo ? `⠀\n${data?.Perfil?.Sexo}` : `⠀\n${e.Deny} Sem sexo definido`
        const niver = data?.Perfil?.Aniversario ? `⠀\n🎉 ${data?.Perfil?.Aniversario}` : `⠀\n${e.Deny} Sem aniversário definido`
        const job = data?.Perfil?.Trabalho ? `⠀\n👷 ${data?.Perfil?.Trabalho}` : `⠀\n${e.Deny} Sem profissão definida`
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

        const banner = await getBanner().catch(() => null)

        Embed.title = `${vip} ${user.id === author.id ? 'Seu perfil' : `Perfil de ${user.username}`}`
        Embed.description = null
        Embed.thumbnail = { url: user.displayAvatarURL({ dynamic: true }) }
        Embed.image = { url: banner || data.Walls?.Set || null }
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
            }
        ]

        const warnsFormat = guildData?.Warns?.Users || {}
        const warns = Object.values(warnsFormat[`${user.id}`] || {})

        if (warns.length > 0)
            Embed.footer = { text: `${warns.length} avisos neste servidor` }

        const selectMenuObject = {
            type: 1,
            components: [{
                type: 3,
                custom_id: 'profile',
                placeholder: 'Opções do perfil',
                options: [
                    {
                        label: `${likes} likes`,
                        emoji: e.Like,
                        description: `Dar um like para ${user.tag}`,
                        value: JSON.stringify({ c: 'like', src: user.id }),
                    },
                    {
                        label: 'Alterar Signo',
                        emoji: '🔅',
                        description: 'Altere o signo do seu perfil',
                        value: JSON.stringify({ c: 'chooseSign' }),
                    },
                    {
                        label: 'Alterar Sexo',
                        emoji: '🚻',
                        description: 'Altere o sexo do seu perfil',
                        value: JSON.stringify({ c: 'chooseGender' })
                    }
                ]
            }]
        }

        if (author.id === user.id)
            selectMenuObject.components[0].options.push({
                label: 'Editar',
                emoji: '📝',
                description: 'Alterar os dados do perfil',
                value: JSON.stringify({ c: 'editProfile' })
            })

        selectMenuObject.components[0].options.push({
            label: 'Atualizar',
            emoji: "🔄",
            description: 'Force uma atualização no seu perfil',
            value: JSON.stringify({ c: 'refreshProfile' })
        })

        return await interaction.editReply({ embeds: [Embed], components: [selectMenuObject] })

        async function showModal() {

            const data = await Database.User.findOne({ id: author.id }, 'Perfil')

            if (!data) {
                await Database.registerUser(author)
                return await interaction.reply({
                    content: `${e.Database} | DATABASE | Por favor, tente novamente.`,
                    ephemeral: true
                })
            }

            const title = data?.Perfil?.Titulo || null
            const job = data?.Perfil?.Trabalho || null
            const niver = data?.Perfil?.Aniversario || null
            const status = data?.Perfil?.Status || null
            const modal = Modals.editProfileModal(title, job, niver, status)

            return await interaction.showModal(modal)
        }

        async function getBanner() {

            const banner = await axios.get(
                RouteBases.api + Routes.user(user.id),
                {
                    headers: {
                        authorization: `Bot ${process.env.DISCORD_TOKEN}`
                    }
                }
            )
                .then(value => {
                    const user = value.data
                    if (!user.banner) return null
                    RouteBases.cdn
                    return `${RouteBases.cdn}/banners/${user.id}/${user.banner}.${user.banner.startsWith('a_') ? 'gif' : 'png'}?size=2048`
                })
                .catch(() => null)

            return banner
        }

    }
}