import * as util from '../../util/Constants.js'
import Base from './Base.js'
import { formatString } from '../../functions/plugins/plugins.js'

export default class Autocomplete extends Base {
    constructor(interaction) {
        super()
        this.interaction = interaction
        this.user = interaction.user
        this.member = interaction.member
        this.options = interaction.options
        this.guild = interaction.guild
        this.channel = interaction.channel
        this.commandName = interaction.commandName
        this.e = this.emojis
    }

    async build() {

        let { name, value } = this.options.getFocused(true)

        if (name === 'search' && this.commandName === 'anime') return this.indications(value)

        if (['search', 'options', 'delete', 'edit', 'view'].includes(name)) name = this.commandName

        const autocompleteFunctions = {
            look: ['indications', value],
            channel: ['blockedChannels', value],
            users_banned: ['usersBanned', value],
            color: ['utilColors', value],
            cor: ['utilColors', value],
            betchoice: ['betChoices', value],
            blocked_commands: ['blockCommands', value],
            database_users: ['databaseUsers', value],
            balance: ['balanceOptions', value],
            de: ['translateLanguages', value],
            para: ['translateLanguages', value],
            search_guild: ['allGuilds', value],
            server: ['allGuilds', value],
            search_user: ['allUsers', value],
            user: ['allUsers', value],
            change_background: ['changeLevelBackground', value],
            rather: ['rather', value],
            buy_background: ['buyLevelBackground', value],
            select_country: ['flagSearch', value],
            command: ['commandList', value],
            sugest_channel: ['ideiaChannels', value],
            available_polls: ['available_polls', value],
            report_channel: ['reportChannels', value],
            log_channel: ['logChannels', value],
            select_logo_marca: ['select_logo_marca', value],
            remove_sinonimo: ['remove_sinonimo', value],
            roles_in_autorole: ['roles_in_autorole', value],
            delete_lembrete: ['delete_lembrete', value],
            quiz_question: ['quiz_question', value],
            select_giveaway: ['select_giveaway', value],
            available_bets: ['available_bets', value],
            blackjacks: ['blackjacks', value],
            wallpaper: ['wallpapers', value],
            anime: ['wallpapers', value],
            flagadminstration: ['flagAdminOptions'],
            ranking: ['rankingOptions'],
            daily: ['dailyOptions'],
            answers: ['answers'],
            level_options: ['levelOptions'],
            option: ['ideaCommandOptions'],
            editar_imagem_com_censura: ['editImageLogoMarca']
        }[name]

        if (autocompleteFunctions)
            return this[autocompleteFunctions[0]](autocompleteFunctions[1])

        return await this.respond()
    }

    async indications(value) {

        const allAnimes = await this.Database.animeIndications() || []

        if (!allAnimes || !allAnimes.length)
            return await this.respond([{
                name: 'Nenhum anime por aqui, que tal indicar um novo?',
                value: 'indicate'
            }])

        const fill = allAnimes.filter(anime => {
            return RegExp(value, "i").test(anime.name)
                || anime.authorId === value
                || anime.category.find(cat => cat?.toLowerCase() === value?.toLowerCase())
                || anime.gender.find(gen => gen?.toLowerCase() === value?.toLowerCase())
                || anime.targetPublic.find(pub => pub?.toLowerCase() === value?.toLowerCase())
                || RegExp(value, "i").test(this.client.users.resolve(anime.authorId)?.tag || '0')
        })

        if (!fill || !fill.length)
            return await this.respond([{
                name: 'Nenhum anime por aqui, que tal indicar um novo?',
                value: 'indicate'
            }])

        const mapped = fill.map(anime => ({ name: anime.name, value: anime.name }))
        return await this.respond(mapped)
    }

    async rather(value) {

        const allData = await this.Database.Rather.find({})

        if (!allData || !allData.length) return await this.respond([{
            name: 'Nada por aqui, que tal sugerir uma nova pergunta?',
            value: 'suggest'
        }])

        value = value?.toLowerCase()

        const fill = this.client.staff.includes(this.user.id)
            ? allData.filter(data => {
                return data.id.toLowerCase().includes(value)
                    || this.client.users.resolve(data.authorId)?.tag?.toLowerCase().includes(value)
                    || data.authorId.includes(value)
                    || data.optionOne.question.toLowerCase().includes(value)
                    || data.optionTwo.question.toLowerCase().includes(value)
            }) || []
            : allData
                .filter(data => data.authorId == this.user.id)
                .filter(data => {
                    return data.id.toLowerCase().includes(value)
                        || this.client.users.resolve(data.authorId)?.tag?.toLowerCase().includes(value)
                        || data.authorId.includes(value)
                        || data.optionOne.question.toLowerCase().includes(value)
                        || data.optionTwo.question.toLowerCase().includes(value)
                }) || []


        const mapped = fill.length > 0
            ? fill.map(data => ({ name: `${data.id} - ${this.client.users.resolve(data.authorId)?.tag || 'Not Found'} - ${data.optionOne.question}`, value: data.id }))
            : [{
                name: 'Nada por aqui, que tal sugerir uma nova pergunta?',
                value: 'suggest'
            }]

        return await this.respond(mapped)
    }

    async available_polls(value) {

        const guildData = await this.Database.Guild.findOne({ id: this.guild.id }, 'Polls')
        const polls = guildData.Polls || []

        if (!polls || !polls.length) return await this.respond()

        const authorPolls = polls.filter(poll => poll.Author === this.user.id)
        if (!authorPolls || !authorPolls.length) return await this.respond()

        const fill = authorPolls.filter(({ MessageID, ChannelId, GuildId, Text }) => {
            return MessageID.includes(value)
                || ChannelId.includes(value)
                || GuildId.includes(value)
                || Text.toLowerCase().includes(value?.toLowerCase())
        })

        if (!fill || !fill.length) return await this.respond()

        const mapped = fill.map(poll => ({ name: `${poll.Text}`, value: poll.MessageID })) || []
        if (!mapped || !mapped.length) return await this.respond()

        return await this.respond(mapped)

    }

    async dailyOptions() {

        const data = [
            {
                name: 'Meu status do daily',
                value: 'sequency'
            },
            {
                name: 'Ativar lembrete automático',
                value: 'reminder'
            }
        ]

        return await this.respond(data)
    }

    async rankingOptions() {
        if (!this.client.staff?.includes(this.user.id)) return await this.respond()

        return await this.respond([{ name: 'Atualizar rankings', value: 'refresh' }])
    }

    async wallpapers(value) {

        const allWallpaper = Object.keys(this.Database.Wallpapers || {})

        if (!allWallpaper || !allWallpaper.length) return await this.respond()

        const fill = allWallpaper.filter(name => name.toLowerCase().includes(value?.toLowerCase()))
        const mapped = fill.map(name => ({ name: name, value: name }))

        if (mapped.length > 2)
            mapped.unshift({
                name: 'Ver todos os wallpapers',
                value: 'all'
            })

        return await this.respond(mapped)
    }

    async blackjacks(value) {

        const allBets = await this.Database.Cache.Blackjack.all() || []
        if (!allBets || !allBets.length) return await this.respond()

        const availableBlackjacks = allBets.filter(gameData => gameData.value.userId === this.user.id)

        if (!availableBlackjacks || !availableBlackjacks.length) return await this.respond()

        const noMultiplayers = availableBlackjacks.filter(gameData => !gameData.value.availablePlayers)
        const mapped = availableBlackjacks.map(gameData => ({ name: `${gameData.value.availablePlayers ? 'Multiplayer' : 'Solo'} - ${gameData.value.bet} Safiras`, value: gameData.id }))
        const fill = mapped.filter(bet => bet.name.toLowerCase().includes(value.toLowerCase()) || bet.value.includes(value))

        if (noMultiplayers.length > 1)
            fill.unshift({
                name: `Resgatar todos os ${noMultiplayers.length} blackjacks solos`,
                value: 'all'
            })

        return await this.respond(fill)

    }

    async available_bets(value) {

        const allBets = await this.Database.Cache.Bet.get('Bet')
        if (!allBets) return await this.respond()

        const values = Object.values(allBets || {})
        const availableBets = values.filter(bet => bet.authorId === this.user.id)

        if (!availableBets || !availableBets.length) return await this.respond()

        const mapped = availableBets.map(bet => ({ name: `${bet.amount} Safiras e ${bet.players.length} jogadores`, value: bet.messageId }))
        const fill = mapped.filter(bet => bet.name.toLowerCase().includes(value.toLowerCase()) || bet.value.includes(value))

        if (fill.length > 1)
            fill.unshift({
                name: `Resgatar todas as ${availableBets.length} apostas`,
                value: 'all'
            })

        return await this.respond(fill)
    }

    async answers() {

        const { options } = this.interaction
        const questionIndex = options.getInteger('quiz_question')
        const quizData = this.Database.Quiz
        const question = quizData[questionIndex]

        if (!question || question.answers.length === 1) return await this.respond()

        const mapped = question.answers.map(answer => ({ name: answer, value: answer }))
        return await this.respond(mapped)
    }

    async select_giveaway(value) {

        const guildData = await this.Database.Guild.findOne({ id: this.guild.id }, 'Giveaways')
        const giveaways = guildData?.Giveaways || null

        if (!giveaways) return this.respond()

        const fill = value ?
            giveaways.filter(data =>
                data.MessageID?.toLowerCase().includes(value)
                || data.Prize?.toLowerCase().includes(value?.toLowerCase())
                || data.Winners === parseInt(value)
            )
            : giveaways

        const mapped = fill.map(gw => ({ name: `${gw.MessageID} | ${gw.Winners > 1 ? `(${gw.Winners}) vencedores` : '(1) vencedor'} | ${gw.Prize}`, value: gw.MessageID }))

        if (giveaways.length > 2)
            mapped.unshift({ name: 'Deletar todos os sorteios', value: 'all' })

        return await this.respond(mapped)

    }

    async quiz_question(value) {

        const quizData = this.Database.Quiz
        const fill = value ?
            quizData.filter(data =>
                data.question?.toLowerCase().includes(value?.toLowerCase())
                || data.answers.find(resp => resp.toLowerCase().includes(value?.toLowerCase()))
            )
            : quizData

        const mapped = fill.map(data => ({ name: data.question, value: quizData.findIndex(question => question.question === data.question) }))
        return await this.respond(mapped)
    }

    async delete_lembrete(value) {

        const allReminders = await this.Database.Reminder.find({}) || []
        const userReminders = allReminders.filter(reminders => reminders.userId === this.user.id)

        if (!userReminders || userReminders.length === 0) return this.respond()

        const fill = userReminders.filter(reminders => reminders.RemindMessage?.toLowerCase().includes(value?.toLowerCase()) || reminders.id.toLowerCase().includes(value?.toLowerCase()))
        const mapped = fill.map(reminder => ({ name: `${reminder.id} - ${reminder.RemindMessage}`, value: reminder.id }))

        if (mapped.length > 1)
            mapped.unshift({ name: 'Deletar todos os lembretes', value: 'all' })

        return this.respond(mapped)
    }

    async editImageLogoMarca() {
        return this.respond([{ name: 'Excluir imagem censurada', value: 'null' }])
    }

    async roles_in_autorole(value) {

        const guildData = await this.Database.Guild.findOne({ id: this.guild.id }, 'Autorole')
        const rolesInAutorole = guildData?.Autorole || []
        if (rolesInAutorole.length === 0) return this.respond([{ name: 'Nenhum cargo configurado.', value: 'info' }])

        const fill = rolesInAutorole.filter(id => id.includes(value?.toLowerCase()))
        const mapped = fill.map(id => {
            const role = this.guild.roles.cache.get(id)
            if (!role) removeRole(id)

            return { name: `${role.name || 'Cargo não encontrado'}`, value: `${role?.id || `${id}.`}` }
        })

        const removeRole = async (id) => {
            await this.Database.Guild.updateOne(
                { id: this.guild.id },
                { $pull: { Autorole: id } }
            )
            return
        }

        return this.respond(mapped)
    }

    async select_logo_marca(value) {
        const logoData = this.Database.Logomarca || []
        const fill = logoData.filter(marca => marca?.answers.find(name => name?.toLowerCase()?.includes(value.toLowerCase())))
        const mapped = fill.map(marca => ({ name: formatString(marca?.answers[0]), value: marca?.answers[0] }))
        return this.respond(mapped)
    }

    async remove_sinonimo(value) {
        const logoData = this.Database.Logomarca || []
        const selectLogo = this.options.getString('select_logo_marca') || null

        if (!selectLogo) return this.respond()

        const logo = logoData.find(data => data.answers[0] === selectLogo)

        if (!logo || logo?.answers.length <= 1) return this.respond()

        const mapped = logo.answers
            .slice(1)
            .map(name => ({ name: formatString(name), value: name }))
            .filter(logo => logo.name?.toLowerCase()?.includes(value?.toLowerCase()))

        return this.respond(mapped)
    }

    async ideiaChannels(value) {

        const channels = this.guild.channels.cache.filter(channel => ['GUILD_TEXT', 'GUILD_NEWS'].includes(channel.type))
        const guildData = await this.Database.Guild.findOne({ id: this.guild.id }, 'IdeiaChannel')
        const channelId = guildData?.IdeiaChannel || null
        const mapped = []

        channels.map(channel => {
            if (channel.id === channelId) return
            return mapped.push({ name: channel.name, value: channel.id })
        })

        const newMapped = [...mapped.filter(data => data?.name?.toLowerCase()?.includes(value.toLowerCase()))]

        if (channelId)
            newMapped.unshift({
                name: 'Desativar sistema de sugestões',
                value: 'disableSugestChannel'
            })

        if (newMapped.length > 24) newMapped.length = 24
        return this.respond(newMapped)
    }

    async logChannels(value) {

        const channels = this.guild.channels.cache.filter(channel => ['GUILD_TEXT', 'GUILD_NEWS'].includes(channel.type))
        const guildData = await this.Database.Guild.findOne({ id: this.guild.id }, 'LogChannel')
        const channelId = guildData?.LogChannel || null
        const mapped = []

        channels.map(channel => {
            if (channel.id === channelId) return
            return mapped.push({ name: channel.name, value: channel.id })
        })

        const newMapped = [...mapped.filter(data => data?.name?.toLowerCase()?.includes(value.toLowerCase()))]

        if (channelId)
            newMapped.unshift({
                name: 'Desativar sistema GSN (Log Channel)',
                value: 'disableLogChannel'
            })

        if (newMapped.length > 24) newMapped.length = 24
        return this.respond(newMapped)
    }

    async reportChannels(value) {

        const channels = this.guild.channels.cache.filter(channel => ['GUILD_TEXT', 'GUILD_NEWS'].includes(channel.type))
        const guildData = await this.Database.Guild.findOne({ id: this.guild.id }, 'ReportChannel')
        const channelId = guildData?.ReportChannel || null
        const mapped = []

        channels.map(channel => {
            if (channel.id === channelId) return
            return mapped.push({ name: channel.name, value: channel.id })
        })

        const newMapped = [...mapped.filter(data => data?.name?.toLowerCase()?.includes(value.toLowerCase()))]

        if (channelId)
            newMapped.unshift({
                name: 'Desativar sistema de reportes',
                value: 'disableReportChannel'
            })

        if (newMapped.length > 24) newMapped.length = 24
        return this.respond(newMapped)
    }

    async ideaCommandOptions() {

        const mapped = [{
            name: `(Modal) Enviar uma sugestão para ${this.client.user.username}`,
            value: 'sugestBot'
        }]

        const guildData = await this.Database.Guild.findOne({ id: this.guild.id }, 'IdeiaChannel ReportChannel')
        const channel = (channelId) => this.guild.channels.cache.has(channelId)

        mapped.push({
            name: `(Modal) Enviar uma sugestão para ${this.guild.name}${channel(guildData?.IdeiaChannel) ? '' : ' (Recurso desabilitado)'}`,
            value: channel(guildData?.IdeiaChannel) ? 'sugestServer' : 'disabled'
        })

        mapped.push({
            name: `(Modal) Enviar um reporte para ${this.guild.name}${channel(guildData?.ReportChannel) ? '' : ' (Recurso desabilitado)'}`,
            value: channel(guildData?.ReportChannel) ? 'reportServer' : 'disabled'
        })

        return this.respond(mapped)
    }

    async flagAdminOptions() {
        const data = await this.Database.Client.findOne({ id: client.user.id }, 'Moderadores Administradores')
        if (![...data?.Administradores, this.Database.Names.Lereo, ...data?.Moderadores]?.includes(this.user.id)) return this.respond()

        return this.respond([
            {
                name: 'Nova bandeira',
                value: 'newFlag'
            },
            {
                name: 'Editar bandeira',
                value: 'editFlag'
            },
            {
                name: 'Remover bandeira',
                value: 'remove'
            },
            {
                name: 'Adicionar um sinônimo',
                value: 'addNewSynonym'
            },
            {
                name: 'Remover um sinônimo',
                value: 'removeSynonym'
            },
            {
                name: 'Lista de bandeiras',
                value: 'list'
            },
            {
                name: 'Bandeiras sem imagem',
                value: 'noflaglist'
            }
        ])
    }

    flagSearch(value) {
        const flags = this.Database.Flags

        const fill = flags.filter(flag =>
            flag.country.find(band => band.toLowerCase().includes(value.toLowerCase()))
            || flag.flag === value
            || flag.image === value
        )

        const mapped = fill.map(flag => ({ name: formatString(flag.country[0]), value: flag.country[0] })).sort()
        return this.respond(mapped)
    }

    async blockedChannels(value) {
        const data = await this.Database.Guild.findOne({ id: this.guild.id }, 'Blockchannels')
        const channelsBlocked = data?.Blockchannels?.Channels || []
        const named = channelsBlocked.map(channelId => this.guild.channels.cache.get(channelId))
        const fill = named.filter(ch => ch && ch?.name.toLowerCase().includes(value?.toLowerCase())) || []
        const mapped = fill.map(ch => {
            const nameWithCategory = `${ch.name}${ch.parent ? ` - ${ch.parent.name}` : ''}`
            return { name: nameWithCategory, value: ch.id }
        })
        return this.respond(mapped)
    }

    async usersBanned(value) {
        const banneds = await this.guild.bans.fetch()
        const banned = banneds.toJSON()
        const fill = banned.filter(data => data?.user.tag.toLowerCase().includes(value.toLowerCase()) || data?.user.id.includes(value)) || []
        const mapped = fill.map(data => ({
            name: `${data.user.tag} - ${data.user.id} | ${data.reason?.slice(0, 150) || 'Sem razão definida'}`,
            value: data.user.id
        }))
        return this.respond(mapped)
    }

    utilColors(value) {
        const colors = Object.keys(util.Colors || {})
        const fill = colors.filter(data => util.ColorsTranslate[data].toLowerCase().includes(value.toLowerCase()))
        const mapped = fill.map(data => ({ name: util.ColorsTranslate[data], value: data }))
        return this.respond(mapped)
    }

    async betChoices(value) {
        const data = await this.Database.Client.findOne({ id: this.client.user.id }, 'GlobalBet')
        const bets = data?.GlobalBet || []

        const betObject = [
            { name: '0', length: bets['0']?.length },
            { name: '100', length: bets['100']?.length },
            { name: '2000', length: bets['2000']?.length },
            { name: '5000', length: bets['5000']?.length },
            { name: '10000', length: bets['10000']?.length },
            { name: '20000', length: bets['20000']?.length },
            { name: '30000', length: bets['30000']?.length },
            { name: '40000', length: bets['40000']?.length },
            { name: '50000', length: bets['50000']?.length },
            { name: '60000', length: bets['60000']?.length },
            { name: '70000', length: bets['70000']?.length },
            { name: '80000', length: bets['80000']?.length },
            { name: '90000', length: bets['90000']?.length },
            { name: '100000', length: bets['100000']?.length }
        ]

        const fill = betObject.filter(d => d.name.includes(value))
        const mapped = fill.map(d => ({ name: `${d.name} Safiras | ${d.length || 0} apostas em espera`, value: `${d.name}` }))
        return this.respond(mapped)
    }

    async blockCommands(value) {
        const data = await this.Database.Client.findOne({ id: this.client.user.id }, 'ComandosBloqueadosSlash')
        const bugs = data?.ComandosBloqueadosSlash || []
        const fill = bugs.filter(bug => bug.cmd?.toLowerCase().includes(value.toLowerCase()) || bug.error?.toLowerCase().includes(value.toLowerCase()))
        const mapped = fill.map(bug => ({ name: `${bug.cmd} | ${bug.error}`, value: bug.cmd }))

        if (mapped.length > 1)
            mapped.unshift({
                name: 'Desbloquear todos os comandos',
                value: 'all'
            })

        return this.respond(mapped)
    }

    async commandList(value) {
        const cmds = this.client.slashCommands.toJSON()
        const fill = cmds.filter(cmdName => cmdName.name?.toLowerCase().includes(value.toLowerCase()))
        const mapped = fill.map(cmdName => ({ name: cmdName.name, value: cmdName.name }))

        if (!value?.length || 'todos os comandos'.includes(value.toLowerCase()))
            mapped.unshift({ name: 'Todos os comandos', value: 'all' })

        return this.respond(mapped)
    }

    translateLanguages(value) {
        const languages = Object.entries(util.Languages)
        const fill = languages.filter(([a, b]) => a.includes(value.toLowerCase()) || b.toLowerCase().includes(value.toLowerCase()))
        const mapped = fill.map(([_, b]) => ({ name: b, value: b }))
        return this.respond(mapped)
    }

    async balanceOptions(value) {

        const isStaff = this.client.admins.includes(this.user.id)
        const options = [{
            name: 'Esconder só pra mim',
            value: 'hide'
        }]

        if (isStaff)
            options.push(
                {
                    name: 'Adicionar Safiras',
                    value: 'add'
                },
                {
                    name: 'Remover Safiras',
                    value: 'remove'
                },
                {
                    name: 'Deletar Safiras',
                    value: 'delete'
                },
                {
                    name: 'Definir um novo valor de Safiras',
                    value: 'reconfig'
                }
            )

        const fill = options.filter(data => data.name.toLowerCase().includes(value.toLowerCase()))
        return await this.respond(fill)

    }

    async databaseUsers(value) {

        const dataUsers = this.client.databaseUsers
        const users = this.client.users.cache
        if (!dataUsers || dataUsers.length === 0) return this.respond()

        const fill = dataUsers
            .map(id => users.find(data => data.id === id))
            .filter(user => {
                return user?.tag?.toLowerCase().includes(value.toLowerCase())
                    || user?.id?.includes(value)
            })

        const mapped = fill
            .filter(x => x)
            .map(user => ({
                name: `${user.tag} | ${user.id}`,
                value: user.id
            }))
        return await this.respond(mapped)
    }

    async allGuilds(value) {

        const guilds = this.client.allGuilds
        if (!guilds || guilds.length === 0) return this.respond()

        const fill = guilds
            .filter(guild =>
                guild.name.toLowerCase().includes(value.toLowerCase())
                || guild.id.includes(value)
            )

        const mapped = fill.map(guild => ({ name: `(${guild.members.length}) - ${guild.name} | ${guild.id}`, value: guild.id }))
        return this.respond(mapped)
    }

    async allUsers(value) {

        const users = this.client.allUsers
        if (!users || users.length === 0) return this.respond()

        const fill = users
            .filter(user => {
                return user?.tag?.toLowerCase().includes(value?.toLowerCase())
                    || user?.id?.includes(value)
            })

        const mapped = fill
            .filter(x => x)
            .map(user => ({
                name: `${user.tag} | ${user.id}`,
                value: user.id
            }))

        return this.respond(mapped)
    }

    async changeLevelBackground(value) {
        const userData = await this.Database.User.findOne({ id: this.user.id }, 'Walls') || []
        const clientData = await this.Database.Client.findOne({ id: this.client.user.id }, 'BackgroundAcess') || []
        const wallSetted = userData.Walls?.Set

        const userBackground = clientData?.BackgroundAcess.includes(this.user.id)
            ? Object.keys(this.Database.BgLevel)
            : userData.Walls?.Bg

        let validWallpapers = userBackground?.map(bg => {
            const data = this.Database.BgLevel[bg]
            if (!data || data.Image === wallSetted) return
            return { name: `${bg} - ${data.Name}`, value: bg }
        }) || []

        if (validWallpapers.length > 0) {

            validWallpapers = validWallpapers
                .filter(a => a)
                .filter(data => data.name.toLowerCase().includes(value.toLowerCase()))

            if (wallSetted)
                validWallpapers.unshift({
                    name: 'Retirar Background Atual',
                    value: 'bg0'
                })
        }

        return this.respond(validWallpapers)
    }

    async buyLevelBackground(value) {

        const clientData = await this.Database.Client.findOne({ id: this.client.user.id }, 'BackgroundAcess') || []
        if (clientData?.BackgroundAcess.includes(this.user.id)) return this.respond()

        const userData = await this.Database.User.findOne({ id: this.user.id }, 'Walls') || []
        const userBackgrounds = userData.Walls?.Bg || []
        const backgrounds = Object.entries(this.Database.BgLevel || {})
        const walls = backgrounds
            .sort((a, b) => {
                const num = parseInt(a[0].slice(2, 5))
                const num2 = parseInt(b[0].slice(2, 5))
                return num - num2
            })
            .filter(bg =>
                !userBackgrounds.includes(bg[0])
                && bg[0] !== 'bg0'
                && bg[1]?.Limit > 0
            ) || []

        const mapped = walls?.map(bg => {

            const limit = bg[1]?.Limit > 0 ? ` | Estoque: ${bg[1]?.Limit || 0}` : ''
            const nameData = `${bg[0]} - ${bg[1].Name} | ${bg[1].Price} Safiras${limit}`

            return { name: nameData, value: bg[0] }

        })
            .filter(data => data.name.toLowerCase().includes(value.toLowerCase())) || []

        return this.respond(mapped)
    }

    async levelOptions() {
        const arr = [{ name: 'Esconder mensagem só para mim', value: 'hide' }]

        if (this.client.admins.includes(this.user.id))
            arr.push({ name: 'Usuários que possuem acesso aos Backgrounds', value: 'list' })

        return this.respond(arr)
    }

    async respond(arrayData = []) {

        if (arrayData.length > 25) arrayData.length = 25

        const mappedArray = arrayData.map(data => ({
            name: data?.name.limit('AutocompleteName'),
            value: data?.value.limit('AutocompleteValue')
        }))

        return await this.interaction.respond(mappedArray)
    }
}