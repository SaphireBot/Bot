import { SaphireClient as client, Database } from '../../../../classes/index.js';
import { Emojis as e } from '../../../../util/util.js';
import { ButtonStyle, Message, Routes } from 'discord.js';

export default {
    name: 'perfil',
    description: '[profile] Confira o seu perfil ou o de alguém',
    aliases: ['profile'],
    category: "profile",
    /**
     * @param { Message } message
     * @param { string[] } args
     */
    async execute(message, args) {

        const { author, channel } = message
        const guildData = await Database.getGuild(message.guild.id)
        const clientData = client.clientData
        const Moeda = await message.guild.getCoin()
        const user = await message.getUser(args[0])

        const msg = await message.reply({ content: `${e.Loading} | Localizando e construindo perfil...` })

        if (!user)
            return msg.edit({ content: `${e.Deny} | Nenhum usuário encontrado.` }).catch(() => { })

        if (user.id === client.user.id)
            return msg.edit({
                embeds: [{
                    color: client.blue,
                    description: `${e.VipStar} **Perfil Pessoal de ${client.user.username}**`,
                    thumbnail: { url: user.displayAvatarURL({ forceStatic: false }) },
                    fields: [
                        {
                            name: `👤 Pessoal`,
                            value: `🔰 Princesa do Discord\n${e.DenyX} Não tenho signo\n:tada: 29/4/2021\n${e.CatJump} Gatinha\n👷 Bot no Discord`
                        },
                        {
                            name: '🌟 Títulos',
                            value: `🎃 **Halloween 2021**\n${e.Star}${e.Star}${e.Star}${e.Star}${e.Star}${e.Star}`
                        },
                        {
                            name: '💍 Em um relacionamento com',
                            value: `💍 Itachi Uchiha`
                        },
                        {
                            name: '❤️ Família',
                            value: await client.rest.get(Routes.user(Database.Names.Rody)).then(u => u.username).catch(() => "Indefinido")
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
                }]
            }).catch(() => { })

        if (user.bot)
            return msg.edit({ content: `${e.Deny} | Bots não possuem perfil.` }).catch(() => { })

        const data = await Database.getUser(user.id)

        if (!data)
            return msg.edit({ content: `${e.Database} | DATABASE | Nenhum dado encontrado de ${user?.username || `\`Not Found\``} *\`${user.id}\`* foi encontrado.` }).catch(() => { })

        const Embed = { color: client.blue, description: `${e.Loading} | Construindo perfil...` }

        const money = data.Perfil?.BalanceOcult && (author.id !== user.id || author.id !== config.ownerId)
            ? '||Oculto||'
            : data.Balance?.currency() || 0

        const marry = data?.Perfil?.Marry?.Conjugate
            ? await (async () => {
                const u = (await client.users.fetch(data.Perfil?.Marry.Conjugate))?.username

                if (!u) {

                    await Database.User.updateMany(
                        { id: { $in: [user.id, data.Marry?.Conjugate] } },
                        { $unset: { 'Perfil.Marry': 1 } }
                    )
                    Database.refreshUsersData([user.id, data.Marry?.Conjugate])

                    channel.send(`${e.Database} | DATABASE | Eu não achei o usuário configurado como seu cônjuge. Efetuei a separação.`)
                    return `${e.DenyX} Usuário deletado`
                }

                const time = data?.Perfil?.Marry?.StartAt
                return `${u} - ${Date.Timestamp(new Date(time), 'R', true)}`
            })()
            : "Ninguém"

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
            titles.push("🖌️ **Designer Official**")

        if (clientData.Titles?.Halloween?.includes(user.id))
            titles.push("🎃 **Halloween 2021**")

        const titulo = data.Perfil?.Titulo ? `🔰 ${data.Perfil?.Titulo}` : `${e.DenyX} Sem título definido`

        const Estrelas = {
            Um: data.Perfil?.Estrela?.Um,
            Dois: data.Perfil?.Estrela?.Dois,
            Tres: data.Perfil?.Estrela?.Tres,
            Quatro: data.Perfil?.Estrela?.Quatro,
            Cinco: data.Perfil?.Estrela?.Cinco,
            Seis: data.Perfil?.Estrela?.Seis,
        }

        let stars = `${e.GrayStar}${e.GrayStar}${e.GrayStar}${e.GrayStar}${e.GrayStar}`
        if (Estrelas.Um) stars = `${e.Star}${e.GrayStar}${e.GrayStar}${e.GrayStar}${e.GrayStar}`
        if (Estrelas.Dois) stars = `${e.Star}${e.Star}${e.GrayStar}${e.GrayStar}${e.GrayStar}`
        if (Estrelas.Tres) stars = `${e.Star}${e.Star}${e.Star}${e.GrayStar}${e.GrayStar}`
        if (Estrelas.Quatro) stars = `${e.Star}${e.Star}${e.Star}${e.Star}${e.GrayStar}`
        if (Estrelas.Cinco) stars = `${e.Star}${e.Star}${e.Star}${e.Star}${e.Star}`
        if (Estrelas.Seis) stars = `${e.Star}${e.Star}${e.Star}${e.Star}${e.Star}${e.Star}`

        const status = data?.Perfil?.Status || `${user.id === author.id ? 'Talvez você não conheça o comando' : `${user.username} não conhece o comando`} \`/perfil options: Editar perfil\``
        const signo = data?.Perfil?.Signo ? `⠀\n${data?.Perfil?.Signo}` : `⠀\n${e.DenyX} Sem signo definido`
        const sexo = data?.Perfil?.Sexo ? `⠀\n${data?.Perfil?.Sexo}` : `⠀\n${e.DenyX} Sem sexo definido`
        const niver = data?.Perfil?.Aniversario ? `⠀\n🎉 ${data?.Perfil?.Aniversario}` : `⠀\n${e.DenyX} Sem aniversário definido`
        const job = data?.Perfil?.Trabalho ? `⠀\n👷 ${data?.Perfil?.Trabalho}` : `⠀\n${e.DenyX} Sem profissão definida`
        clientData.TopGlobal?.Level === user.id ? titles.push(`${e.RedStar} **Top Global Level**`) : ''
        clientData.TopGlobal?.Likes === user.id ? titles.push(`${e.Like} **Top Global Likes**`) : ''
        clientData.TopGlobal?.Money === user.id ? titles.push(`${e.MoneyWings} **Top Global Money**`) : ''
        clientData.TopGlobal?.Quiz === user.id ? titles.push(`🧠 **Top Global Quiz**`) : ''
        clientData.TopGlobal?.Mix === user.id ? titles.push(`🔡 **Top Global Mix**`) : ''
        clientData.TopGlobal?.Jokempo === user.id ? titles.push(`✂️ **Top Global Jokempo**`) : ''
        clientData.TopGlobal?.Memory === user.id ? titles.push(`${e.SaphireWhat || '❔'} **Top Global Memory**`) : ''
        clientData.TopGlobal?.Forca === user.id ? titles.push(`😵 **Top Global Forca**`) : ''
        clientData.TopGlobal?.Flag === user.id ? titles.push(`🎌 **Top Global Flag Gaming**`) : ''

        if (user.fetch) await user.fetch().catch(() => { })
        const banner = user.bannerURL({ size: 2048 })

        Embed.title = `${vip} ${user.id === author.id ? 'Seu perfil' : `Perfil de ${user.username}`}`
        Embed.description = null
        Embed.thumbnail = { url: user.displayAvatarURL({ forceStatic: false }) }
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
                name: '💍 Em um relacionamento com',
                value: marry
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

        const buildedData = {
            content: null,
            embeds: [Embed],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: "Ver perfil no site",
                            emoji: e.Animated.SaphireReading,
                            url: client.url + `/profile/${user.id}`,
                            style: ButtonStyle.Link
                        }
                    ]
                },
                {
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: 'profile',
                        placeholder: 'Opções do perfil',
                        options: [
                            {
                                label: `${likes} likes`,
                                emoji: e.Like,
                                description: `Dar um like para ${user.username}`,
                                value: JSON.stringify({ c: 'like', a: message.author.id, u: user.id }),
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
                            },
                            {
                                label: 'Editar',
                                emoji: '📝',
                                description: 'Alterar os dados do perfil',
                                value: JSON.stringify({ c: 'editProfile' })
                            }
                        ]
                    }]
                }
            ]
        }

        return msg.edit(buildedData).catch(() => message.reply(buildedData))
    }
}