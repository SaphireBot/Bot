import rankCard from './level/build.level.js'
import { HexColors, ColorsTranslate, Permissions } from '../../../../util/Constants.js'
import buyBackground from './level/buy.level.js'

export default {
    name: 'level',
    description: '[level] Confira seu level ou de alguém',
    type: 1,
    dm_permission: false,
    options: [
        {
            name: 'user',
            description: 'Selecione um membro para ver o level dele',
            type: 6
        },
        {
            name: 'search_user',
            description: 'Pesquise por um usuário',
            type: 3,
            autocomplete: true
        },
        {
            name: 'color',
            description: 'Defina a cor em que o seu card é apresentado',
            type: 3,
            autocomplete: true
        },
        {
            name: 'change_background',
            description: 'Mude seu background para ficar estiloso.',
            type: 3,
            autocomplete: true
        },
        {
            name: 'buy_background',
            description: 'Compre backgrounds',
            type: 3,
            autocomplete: true
        },
        {
            name: 'level_options',
            description: 'Mais opções aqui',
            type: 3,
            autocomplete: true
        }
    ],
    async execute({ interaction, client, Database, clientData, emojis: e }) {

        const { BgLevel: LevelWallpapers } = Database
        const { options, user: author, guild } = interaction

        const user = options.getUser('user') || author
        const level_options = options.getString('level_options')
        const hide = level_options === 'hide'
        const bg = options.getString('change_background')
        const changeColor = options.getString('color')
        const showList = level_options === 'list'

        if (changeColor) return defineColor(changeColor)

        const bgCode = options.getString('buy_background')
        if (bgCode) return buyBackground({ interaction, code: bgCode })

        const userData = await Database.User.findOne({ id: user.id }, 'Balance Walls Level Xp Color.Set')
        const data = {}

        if (showList) return bgAcess()

        if (!userData)
            return await interaction.reply({
                content: `${e.Database} | DATABASE | O usuário **${user?.tag || 'Indefinido'}** *\`${user?.id || '0'}\`* não foi encontrado no meu banco de dados.`,
                ephemeral: true
            })

        if (user.bot)
            return await interaction.reply({
                content: `${e.Deny} | Bots não possuem experiência.`,
                ephemeral: true
            })

        if (bg) return setNewWallpaper()

        if (!guild.clientHasPermission(Permissions.AttachFiles))
            return await interaction.reply({
                content: `${e.Info} | Eu preciso da permissão **Enviar Arquivos** para executar este comando.`
            })

        return SendLevel()

        async function setNewWallpaper() {

            const background = LevelWallpapers[bg]
            const atual = userData.Walls.Set

            if (!background)
                return await interaction.reply({
                    content: `${e.Info} | Este background não existe. Selecione um background que você possui selecionando a opção na lista de backgrounds. Você pode ver seus backgrounds usando \`/level change_background:\``,
                    ephemeral: true
                })

            if (atual === background.Image)
                return await interaction.reply({
                    content: `${e.Info} | Este wallpaper já é o seu atual.`,
                    ephemeral: true
                })

            if (bg === 'bg0') {
                Database.delete(author.id, 'Walls.Set')
                return await interaction.reply({ content: `${e.Check} | Você resetou seu background para \`${background.Name}\`.` })
            }

            if (!clientData.BackgroundAcess?.includes(author.id) && !userData.Walls?.Bg?.includes(bg))
                return await interaction.reply({
                    content: `${e.Deny} | Você não tem esse background. Que tal comprar ele usando \`/level buy_background: ${bg}\`?`,
                    ephemerak: true
                })

            Database.updateUserData(author.id, 'Walls.Set', background.Image)
            return await interaction.reply({
                embeds: [{
                    color: client.green,
                    description: `${e.Check} | Você alterou seu background para \`${background.Name}\``,
                    image: { url: background.Image }
                }]
            })

        }

        async function bgAcess() {

            const bgacess = clientData.BackgroundAcess

            if (!bgacess || bgacess.length === 0)
                return await interaction.reply({
                    content: `${e.Info} | Não há ninguém na lista de acesso livre aos wallpapers`
                })

            const format = bgacess.map(id => `${client.users.resolve(id)?.tag || 'Não encontrado'} - \`${id}\``).join('\n')

            return await interaction.reply({
                embeds: [{
                    color: client.blue,
                    title: `${e.ModShield} Background Free Access`,
                    description: format || 'Lista vazia'
                }]
            })
        }

        async function SendLevel() {
            await interaction.deferReply({ ephemeral: hide })

            await build()

            return await rankCard(interaction, {
                member: user, // String
                level: data.level || 0, // Number
                currentXP: data.exp || 0, // Number
                neededXP: data.xpNeeded || 0, // Number
                rank: data.rank || 0, // Number
                color: userData?.Color?.Set, // String
                backgroundUrl: userData.Walls?.Set || LevelWallpapers?.bg0?.Image || null // String
            })
                .catch(console.log)

        }

        async function build() {
            data.level = userData.Level || 0
            data.exp = userData.Xp || 0
            data.xpNeeded = parseInt((userData.Level || 1) * 275)

            const usersAllData = await Database.Cache.Ranking.get('Rankings.Xp')

            if (!usersAllData || usersAllData.length === 0)
                return data.rank = 'N/A'

            data.rank = usersAllData.query.findIndex(author => author?.id === user.id) + 1 || '2000^'
            return
        }

        async function defineColor(colorName) {

            const color = HexColors[colorName]

            if (!color)
                return await interaction.reply({
                    content: `${e.Deny} | Cor não existente ou não cadastrada código fonte.`,
                    ephemeral: true
                })

            return await Database.User.updateOne(
                { id: user.id },
                { $set: { "Color.Set": color } },
                {
                    new: true,
                    upsert: true
                }
            )
                .then(async result => {

                    const { modifiedCount } = result

                    if (modifiedCount === 0)
                        return await interaction.reply({
                            content: `${e.Deny} | Esta cor já está configurada no perfil.`,
                            ephemeral: true
                        })

                    return await interaction.reply({
                        content: `${e.Check} | A cor \`${ColorsTranslate[colorName]}\` foi definida com sucesso no seu perfil.`
                    })
                })
                .catch(async err => {
                    console.log(err)
                    return await interaction.reply({
                        content: `${e.Warn} | Houve um erro ao editar a cor do seu perfil.`
                    })
                })

        }

    }
}