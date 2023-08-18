import { Colors, ColorsTranslate, Languages, NSFWImagesCategory, TwitchLanguages } from '../../util/Constants.js'
import { AutocompleteInteraction, PermissionsBitField } from 'discord.js'
import { formatString } from '../../functions/plugins/plugins.js'
import { Database } from '../../classes/index.js'
import { socket } from '../../websocket/websocket.js'
import managerReminder from '../../functions/update/reminder/manager.reminder.js'
import Quiz from '../../classes/games/QuizManager.js'
import Base from './Base.js'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const phrases = require("../commands/slashCommands/games/fasttype/phrases.fasttype.json")

export default class Autocomplete extends Base {
    /**
     * @param { AutocompleteInteraction } interaction 
     */
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

    build() {

        let { name, value } = this.options.getFocused(true)

        if (name === 'search' && this.commandName === 'anime') return this.indications(value)

        if (
            name === 'search' && this.commandName === 'serverinfo'
            || name === 'server' && this.commandName === 'saphire'
        ) return this.serverId(value)

        if (name === 'search' && this.options?.data[0]?.options[0]?.name == 'options') return this.quizAnime(value, true)
        if (name === 'my_content' && this.options?.data[0]?.options[0]?.name == 'options') return this.quizAnime(value, 1)
        if (name === 'search' && this.commandName === 'cantada') return this.showCantadas(value)
        if (name === 'opcoes' && this.commandName === 'cantada') return this.cantadaOptions()

        if (['search', 'options', 'delete', 'edit', 'view']?.includes(name)) name = this.commandName

        const autocompleteFunctions = {
            look: ['indications', value],
            users_banned: ['usersBanned', value],
            method: ['quizAnime', value],
            saphire: ['fanartsSearch', value],
            color: ['utilColors', value],
            cor: ['utilColors', value],
            betchoice: ['betChoices', value],
            blocked_commands: ['blockCommands', value],
            balance: ['balanceOptions', value],
            de: ['translateLanguages', value],
            para: ['translateLanguages', value],
            search_guild: ['serverId', value],
            server: ['serverId', value],
            search_user: ['allUsers', value],
            user: ['allUsers', value],
            change_background: ['changeLevelBackground', value],
            view_wallpaper: ['view_wallpaper', value],
            rather: ['rather', value],
            buy_background: ['buyLevelBackground', value],
            select_country: ['flagSearch', value],
            command: ['commandList', value, name],
            available_polls: ['available_polls', value],
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
            answers: ['answers'],
            level_options: ['levelOptions'],
            editar_imagem_com_censura: ['editImageLogoMarca'],
            comprar: ['rifaNumero', value],
            id: ['giveaway_id', value],
            funcao: ['memesViewer'],
            itens: ['reminders', value],
            selecionar: ['quiz_selecionar', value],
            serverinfo: ['serverId', value],
            streamer: ['disableTwitch', value],
            idioma: ['languageTwitch', value],
            category: ['nsfw_categories', value],
            remove: ['removeAutorole', value],
            to: ['translateTo', value],
            stars: ['stars', value],
            phrase: ['fasttype', value]
        }[name] || []

        if (autocompleteFunctions[0] && autocompleteFunctions?.length)
            return this[autocompleteFunctions[0]](autocompleteFunctions[1], autocompleteFunctions[2])

        return this.respond()
    }

    fasttype(value = "") {

        const data = value?.length
            ? phrases.filter(v => v.id == value || v.phrase.toLocaleLowerCase()?.includes(value?.toLocaleLowerCase()))
            : phrases

        return this.respond(data?.map(v => ({ name: `[${v.id}] ${v.phrase}`, value: v.id })))
    }

    async stars(value) {

        const userData = await Database.getUser(this.user.id)
        const stars = [
            userData?.Perfil?.Estrela?.Um || false,
            userData?.Perfil?.Estrela?.Dois || false,
            userData?.Perfil?.Estrela?.Tres || false,
            userData?.Perfil?.Estrela?.Quatro || false,
            userData?.Perfil?.Estrela?.Cinco || false
        ]

        const mapped = stars
            .map((value, i) => ({
                name: `${i + 1} Estrelas ${value ? "(Já Possui)" : stars[i - 1] ? '(Disponível)' : '(Indisponível)'}`,
                value: `${i + 1}`
            }))
            .filter(d => d.name?.toLocaleLowerCase().includes(value?.toLocaleLowerCase()))

        return this.respond(mapped)
    }

    translateTo(value = "") {
        return this.respond(
            Object
                .entries(Languages)
                .filter(([iso, langName]) => iso.toLowerCase().includes(value.toLowerCase()) || langName.toLowerCase().includes(value.toLowerCase()))
                .map(([iso, langName]) => ({ name: langName, value: iso }))
        )
    }

    async removeAutorole(value) {
        if (!this.member.permissions.has(PermissionsBitField.Flags.ManageRoles, true)) return this.respond()
        const guildData = await this.Database.getGuild(this.guild.id)
        const rolesId = guildData?.Autorole || []

        if (!rolesId?.length) return this.respond()

        const roles = rolesId.map(roleId => ({
            name: `@${this.guild.roles.cache.get(roleId)?.name || 'Cargo Desconhecido'}`,
            value: roleId
        }))
            .filter(
                data => data?.name?.toLowerCase()?.includes(value?.toLowerCase())
                    || data?.value?.toLowerCase()?.includes(value?.toLowerCase())
            )

        return this.respond(roles)
    }

    nsfw_categories(value) {
        const itens = NSFWImagesCategory
            .filter(item => item.includes(value?.toLowerCase()))
            .map(item => ({ name: item, value: item }))

        return this.respond(itens)
    }

    languageTwitch(value) {
        const languages = Object.entries(TwitchLanguages)
        const filter = languages.filter(
            ([ISO, langName]) => ISO.toLowerCase().includes(value.toLowerCase())
                || langName.toLowerCase().includes(value.toLowerCase())
        )

        if (!languages.length) return this.respond()

        const map = filter.map(
            ([ISO, langName]) => ({ name: langName, value: ISO })
        )

        return this.respond(map)
    }

    async disableTwitch(value) {
        const data = await this.Database.getGuild(this.guild.id)
        const twitchData = data?.TwitchNotifications || []
        if (!twitchData?.length) return this.respond()

        const fill = twitchData
            .filter(obj => obj?.channelId?.includes(value) || obj?.streamer?.includes(value))

        if (!fill?.length) return this.respond()

        const map = Array.from(
            new Set(
                fill
                    .map(obj => ({ name: obj?.streamer, value: obj?.streamer }))
                    .filter(obj => obj?.value)
            )
        )

        if (map.length)
            map.unshift({
                name: 'Desativar todos os Streamers',
                value: 'disableAll'
            })

        return this.respond(map)
    }

    async serverId(value) {
        const guilds = await socket?.timeout(2000).emitWithAck("getAllGuilds", "get").catch(() => [])
        if (!guilds || !guilds.length) return this.respond()
        const fill = value ? guilds
            .filter(guild => guild?.name?.toLowerCase()?.includes(value?.toLowerCase()) || guild?.id?.includes(value))
            : guilds
        return this.respond(
            fill
                .map(guild => ({ name: guild?.name, value: guild?.id }))
                .filter(v => v.name && v.value)
        )
    }

    async quiz_selecionar(value) {

        const questions = Quiz.questions
        if (!questions || !Array.isArray(questions)) return
        const fill = questions.filter(question => check(question))

        if (!fill?.length) return this.respond()

        const mapped = fill
            .sort((a, b) => b.hits - a.hits)
            .map(q => ({
                name: `↑${q.hits || 0} x ${q.misses || 0}↓ ${q.question}`,
                value: `${q.questionId}`
            }))

        return this.respond(mapped)

        function check(q) {
            if (!value || !q || !q.answers) return true
            return [
                q.questionId,
                q.question,
                q.category,
                ...q.answers?.map(answer => answer?.answer),
                q.suggestedBy,
                `${q.hits || 0}`,
                `${q.misses || 0}`
            ]
                .map(str => str?.toLowerCase())
                .some(str => str.includes(`${value}`.toLowerCase()))
        }
    }

    async quizAnime(value, isSearch) {

        const methods = []

        if (isSearch) return this.inSearchBuild(value, isSearch)

        if (this.client.staff.includes(this.user.id)) {
            const clientData = await this.Database.Client.findOne({ id: this.client.user.id }, 'AnimeQuizIndication')
            const AnimeQuizIndication = clientData?.AnimeQuizIndication || []
            methods.push({
                name: `${AnimeQuizIndication.length || 0} indicações para análise`,
                value: 'analise'
            })

        }

        return this.respond(methods)
    }

    async inSearchBuild(value, searchValue) {
        let AnimeQuizIndication = this.client.animes.sort(() => Math.random() - Math.random())
        if (!AnimeQuizIndication.length) return this.respond()

        if (searchValue === 1)
            AnimeQuizIndication = AnimeQuizIndication.filter(an => an.sendedFor === this.user.id) || []
        if (!AnimeQuizIndication.length) return this.respond()

        const fill = AnimeQuizIndication
            .filter(an => an.acceptedFor.includes(value)
                || an.name?.toLowerCase()?.includes(value?.toLowerCase())
                || an.anime?.toLowerCase()?.includes(value?.toLowerCase())
                || an.type?.toLowerCase()?.includes(value?.toLowerCase())
                || an.imageUrl?.toLowerCase()?.includes(value?.toLowerCase())
                || an.id?.toLowerCase()?.includes(value?.toLowerCase())
            )
        if (!fill.length) return this.respond()

        const types = {
            anime: 'Anime',
            male: 'Personagem Masculino',
            female: 'Personagem Feminino',
            others: 'Outros'
        }

        const mapped = fill
            .map(an => ({
                name: `${an.name} - ${an.anime} - ${types[an.type]}`,
                value: an.id
            }))

        return this.respond(mapped)
    }

    async reminders(value) {
        const reminders = managerReminder.allReminders.toJSON()
            .filter(r => r.userId === this.user.id)
        if (!reminders.length) return this.respond()

        const filAndMap = reminders.filter(r =>
            r.RemindMessage?.toLowerCase()?.includes(value?.toLowerCase())
            || r.id?.toLowerCase()?.includes(value?.toLowerCase())
        )
            .map(r => ({ name: `${r?.id} - ${r?.RemindMessage}`, value: r?.id }))
        return this.respond(filAndMap)
    }

    // async memesViewer() {

    //     const data = [
    //         {
    //             name: 'Visualizar memes',
    //             value: 'view'
    //         },
    //         {
    //             name: 'visualizar MEUS memes',
    //             value: 'viewmymemes'
    //         }
    //     ]

    //     if (this.client.staff.includes(this.user.id))
    //         data.push({ name: `${this.client.MemesNotApproved.length} memes a serem analisados`, value: 'analise' })

    //     return this.respond(data)
    // }

    async showCantadas(value) {
        const cantadas = this.client.cantadas || []

        if (!cantadas.length)
            return this.respond()

        const v = value?.toLowerCase()

        const fill = cantadas.filter(c =>
            c.id?.toLowerCase()?.includes(v)
            || c.phrase?.toLowerCase()?.includes(v)
            || c.userId?.toLowerCase()?.includes(v)
            || c.acceptedFor?.toLowerCase()?.includes(v)
        )

        if (!fill.length)
            return this.respond()

        const mapped = fill.map(c => ({
            name: `${c.id} - ${c.phrase || "INVALID"}`,
            value: `${c.id}`
        })) || []

        return this.respond(mapped)
    }

    async cantadaOptions() {

        const clientData = await this.Database.Client.findOne({ id: this.client.user.id }, 'CantadasIndicadas')
        const cantadas = clientData.CantadasIndicadas || []

        const options = [{
            name: 'Minhas cantadas',
            value: 'mycantadas'
        },
        {
            name: 'Todas as cantadas',
            value: 'all'
        }]

        if (this.client.staff?.includes(this.user.id))
            options.push(
                {
                    name: `${cantadas.length} cantadas a ser avaliadas`,
                    value: 'analise'
                },
                {
                    name: 'Deletar cantada',
                    value: 'delete'
                }
            )

        return this.respond(options)

    }

    async fanartsSearch(value) {

        const fanarts = this.client.fanarts || []
        if (!fanarts || !fanarts.length) return this.respond()

        const mapped = fanarts.map(fan => ({ name: `${fan.id} - ${fan.name}`, value: `${fan.id}` }))
        const fill = mapped.filter(fan => fan.name?.toLowerCase()?.includes(value?.toLowerCase()))

        return this.respond(fill)
    }

    async rifaNumero(value) {

        const userData = await this.Database.getUser(this.user.id)
        const userBalance = userData?.Balance || 0

        if (!userBalance || userBalance < 1000)
            return this.respond([{
                name: 'Você precisa ter mais de 1000 Safiras para comprar um número',
                value: 0
            }])

        const rifaDocument = await this.Database.Economy.findOne({ id: this.client.user.id }, 'Rifa')

        if (!rifaDocument)
            return this.respond([{
                name: '[Database Find Document Error (0)] Mongoose Document Not Found',
                value: 0
            }])

        const allNumbers = rifaDocument.Rifa?.Numbers || []
        const numbers = [...Array(91).keys()].slice(1)
        const availableNumbers = numbers.filter(num => !allNumbers.find(rifa => rifa.number === num))
        const usersRifa = allNumbers.filter(rifa => rifa?.userId === this.user.id)?.length || 0

        if (usersRifa >= 5)
            return this.respond([{
                name: 'Você já atingiu o limite de 5 Rifas compradas',
                value: 0
            }])

        if (!availableNumbers || !availableNumbers.length)
            return this.respond()

        const quantity = (5 - usersRifa <= 1) ? 'Você só pode comprar +1 número' : `Você pode comprar mais ${5 - usersRifa} números`
        let mapped = availableNumbers.map(num => ({
            name: num < 10 ? `N° 0${num} - ${quantity}` : `N° ${num} - ${quantity}`,
            value: num
        }))

        if (value)
            mapped = mapped.filter(opt => opt.name?.toLowerCase()?.includes(value?.toLowerCase()))

        return this.respond(mapped)
    }

    async indications(value) {

        const allAnimes = await this.Database.animeIndications() || []

        if (!allAnimes || !allAnimes.length)
            return this.respond([{
                name: 'Nenhum anime por aqui, que tal indicar um novo?',
                value: 'indicate'
            }])

        const fill = allAnimes.filter(anime => {
            return RegExp(value, "i").test(anime.name)
                || anime.authorId === value
                || anime.category.find(cat => cat?.toLowerCase() === value?.toLowerCase())
                || anime.gender.find(gen => gen?.toLowerCase() === value?.toLowerCase())
                || anime.targetPublic.find(pub => pub?.toLowerCase() === value?.toLowerCase())
                || RegExp(value, "i").test(this.client.users.resolve(anime.authorId)?.username || '0')
        })

        if (!fill || !fill.length)
            return this.respond([{
                name: 'Nenhum anime por aqui, que tal indicar um novo?',
                value: 'indicate'
            }])

        const mapped = fill.map(anime => ({ name: anime.name, value: anime.name }))
        return this.respond(mapped)
    }

    async rather(value) {

        const allData = await this.Database.Rather.find({})

        if (!allData || !allData.length) return this.respond([{
            name: 'Nada por aqui, que tal sugerir uma nova pergunta?',
            value: 'suggest'
        }])

        value = value?.toLowerCase()

        const fill = this.client.staff?.includes(this.user.id)
            ? allData.filter(data => {
                return data.id?.toLowerCase()?.includes(value)
                    || this.client.users.resolve(data.authorId)?.username?.toLowerCase()?.includes(value)
                    || data.authorId?.includes(value)
                    || data.optionOne.question?.toLowerCase()?.includes(value)
                    || data.optionTwo.question?.toLowerCase()?.includes(value)
            }) || []
            : allData
                .filter(data => data.authorId == this.user.id)
                .filter(data => {
                    return data.id?.toLowerCase()?.includes(value)
                        || this.client.users.resolve(data.authorId)?.username?.toLowerCase()?.includes(value)
                        || data.authorId?.includes(value)
                        || data.optionOne.question?.toLowerCase()?.includes(value)
                        || data.optionTwo.question?.toLowerCase()?.includes(value)
                }) || []


        const mapped = fill.length > 0
            ? fill.map(data => ({ name: `${data.id} - ${this.client.users.resolve(data.authorId)?.username || 'Not Found'} - ${data.optionOne.question}`, value: data.id }))
            : [{
                name: 'Nada por aqui, que tal sugerir uma nova pergunta?',
                value: 'suggest'
            }]

        return this.respond(mapped)
    }

    async available_polls(value) {

        const guildData = await this.Database.getGuild(this.guild.id)
        const polls = guildData.Polls || []

        if (!polls || !polls.length) return this.respond()

        const authorPolls = polls.filter(poll => poll.Author === this.user.id)
        if (!authorPolls || !authorPolls.length) return this.respond()

        const fill = authorPolls.filter(({ MessageID, ChannelId, GuildId, Text }) => {
            return MessageID?.includes(value)
                || ChannelId?.includes(value)
                || GuildId?.includes(value)
                || Text?.toLowerCase()?.includes(value?.toLowerCase())
        })

        if (!fill || !fill.length) return this.respond()

        const mapped = fill.map(poll => ({ name: `${poll.Text}`, value: poll.MessageID })) || []
        if (!mapped || !mapped.length) return this.respond()

        return this.respond(mapped)

    }

    async rankingOptions() {

        const options = [{ name: 'Script Version', value: 'script' }]

        if (this.client.staff?.includes(this.user.id))
            options.push({ name: '[ADMIN ONLY] Atualizar Rankings', value: 'refresh' })

        return this.respond(options)
    }

    async wallpapers(value) {

        const allWallpaper = Object.keys(this.Database.Wallpapers || {})

        if (!allWallpaper || !allWallpaper.length) return this.respond()

        const fill = allWallpaper.filter(name => name?.toLowerCase()?.includes(value?.toLowerCase()))
        const mapped = fill.map(name => ({ name: name, value: name }))

        if (mapped.length > 2)
            mapped.unshift({
                name: 'Ver todos os wallpapers',
                value: 'all'
            })

        return this.respond(mapped)
    }

    async blackjacks(value) {

        const allBets = await this.Database.Cache.Blackjack.all() || []
        if (!allBets || !allBets.length) return this.respond()

        const availableBlackjacks = allBets.filter(gameData => gameData.value.userId === this.user.id)

        if (!availableBlackjacks || !availableBlackjacks.length) return this.respond()

        const noMultiplayers = availableBlackjacks.filter(gameData => !gameData.value.availablePlayers)
        const mapped = availableBlackjacks.map(gameData => ({ name: `${gameData.value.availablePlayers ? 'Multiplayer' : 'Solo'} - ${gameData.value.bet} Safiras`, value: gameData.id }))
        const fill = mapped.filter(bet => bet.name?.toLowerCase()?.includes(value?.toLowerCase()) || bet.value?.includes(value))

        if (noMultiplayers.length > 1)
            fill.unshift({
                name: `Resgatar todos os ${noMultiplayers.length} blackjacks solos`,
                value: 'all'
            })

        return this.respond(fill)

    }

    async available_bets(value) {

        const values = await this.Database.Cache.Bet.all()
        if (!values || !values.length) return this.respond()

        const availableBets = values.filter(bet => bet?.value?.authorId === this.user.id)

        if (!availableBets || !availableBets.length) return this.respond()

        const mapped = availableBets.map(bet => ({ name: `${bet?.value?.amount || bet?.value?.value} Safiras`, value: bet?.value?.messageId || bet.id }))
        const fill = mapped.filter(bet => bet.name?.toLowerCase()?.includes(value?.toLowerCase()) || bet.value?.includes(value))

        if (fill.length > 1)
            fill.unshift({
                name: `Resgatar todas as ${availableBets.length} apostas`,
                value: 'all'
            })

        return this.respond(fill)
    }

    async answers() {

        const { options } = this.interaction
        const questionIndex = options.getInteger('quiz_question')
        const quizData = this.Database.Quiz
        const question = quizData[questionIndex]

        if (!question || question.answers.length === 1) return this.respond()

        const mapped = question.answers.map(answer => ({ name: answer, value: answer }))
        return this.respond(mapped)
    }

    async select_giveaway(value) {

        const guildData = await Database.getGuild(this.guild.id)
        const giveaways = guildData?.Giveaways

        if (!giveaways) return this.respond()

        const fill = value ?
            giveaways.filter(data =>
                data.MessageID?.toLowerCase()?.includes(value)
                || data.Prize?.toLowerCase()?.includes(value?.toLowerCase())
                || data.Winners === parseInt(value)
            )
            : giveaways

        const mapped = fill.map(gw => ({ name: `${gw.MessageID} | ${gw.Winners > 1 ? `(${gw.Winners}) vencedores` : '(1) vencedor'} | ${gw.Prize}`, value: gw.MessageID }))

        return this.respond(mapped)
    }

    async giveaway_id(value) {

        const response = [{
            name: 'Informações sobre o reroll',
            value: 'info'
        }]

        const guildData = await this.Database.getGuild(this.guild.id)
        let giveaways = (guildData?.Giveaways || []).filter(w => !w.Actived && w.Participants?.length)
        if (!giveaways.length) return this.respond(response)

        const fill = value ?
            giveaways.filter(data =>
                data.MessageID?.toLowerCase()?.includes(value)
                || data.Prize?.toLowerCase()?.includes(value?.toLowerCase())
                || data.Winners === parseInt(value)
            )
            : giveaways

        const mapped = fill.map(gw => ({ name: `${gw.Winners > 1 ? `${gw.Winners} vencedores` : '1 vencedor'} | ${gw.Prize}`, value: gw.MessageID }))

        if (mapped.length)
            response.push(...mapped)

        return this.respond(mapped)
    }

    async quiz_question(value) {

        const quizData = this.Database.Quiz
        const fill = value ?
            quizData.filter(data =>
                data.question?.toLowerCase()?.includes(value?.toLowerCase())
                || data.answers.find(resp => resp?.toLowerCase()?.includes(value?.toLowerCase()))
            )
            : quizData

        const mapped = fill.map(data => ({ name: data.question, value: quizData.findIndex(question => question.question === data.question) }))
        return this.respond(mapped)
    }

    async delete_lembrete(value) {

        const allReminders = await this.Database.Reminder.find({}) || []
        const userReminders = allReminders.filter(reminders => reminders.userId === this.user.id)

        if (!userReminders || userReminders.length === 0) return this.respond()

        const fill = userReminders.filter(reminders => reminders.RemindMessage?.toLowerCase()?.includes(value?.toLowerCase()) || reminders.id?.toLowerCase()?.includes(value?.toLowerCase()))
        const mapped = fill.map(reminder => ({ name: `${reminder.id} - ${reminder.RemindMessage}`, value: reminder.id }))

        if (mapped.length > 1)
            mapped.unshift({ name: 'Deletar todos os lembretes', value: 'all' })

        return this.respond(mapped)
    }

    async editImageLogoMarca() {
        return this.respond([{ name: 'Excluir imagem censurada', value: 'null' }])
    }

    async roles_in_autorole(value) {

        const guildData = await this.Database.getGuild(this.guild.id)
        const rolesInAutorole = guildData?.Autorole || []
        if (rolesInAutorole.length === 0) return this.respond([{ name: 'Nenhum cargo configurado.', value: 'info' }])

        const fill = rolesInAutorole.filter(id => id?.includes(value?.toLowerCase()))
        const mapped = fill.map(id => {
            const role = this.guild.roles.cache.get(id)
            if (!role) removeRole(id)

            return { name: `${role.name || 'Cargo não encontrado'}`, value: `${role?.id || `${id}.`}` }
        })

        const removeRole = async (id) => {
            await this.Database.Guild.findOneAndUpdate(
                { id: this.guild.id },
                { $pull: { Autorole: id } },
                { new: true }
            )
                .then(data => Database.saveGuildCache(data.id, data))
            return
        }

        return this.respond(mapped)
    }

    async select_logo_marca(value) {
        const logoData = this.Database.Logomarca || []
        const fill = logoData.filter(marca => marca?.answers.find(name => name?.toLowerCase()?.includes(value?.toLowerCase())))
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
            flag.country.find(band => band?.toLowerCase()?.includes(value?.toLowerCase()))
            || flag.flag === value
            || flag.image === value
        )

        const mapped = fill.map(flag => ({ name: formatString(flag.country[0]), value: flag.country[0] })).sort()
        return this.respond(mapped)
    }

    async usersBanned(value) {
        const banneds = await this.guild.bans.fetch().catch(() => null)

        if (banneds === null)
            return this.respond([{
                name: 'Erro ao obter os usuários banidos',
                value: 'null'
            }])

        if (!banneds?.size)
            return this.respond([{
                name: 'Nenhum usuário banido',
                value: 'nothing here'
            }])

        const banned = banneds.toJSON()
        const fill = banned.filter(data => data?.user?.username?.toLowerCase()?.includes(value?.toLowerCase()) || data?.user?.id?.includes(value)) || []
        const mapped = fill.map(data => ({
            name: `${data.user.username} - ${data.user.id} | ${data.reason?.slice(0, 150) || 'Sem razão definida'}`,
            value: data.user.id
        }))
        return this.respond(mapped)
    }

    utilColors(value) {
        const colors = Object.keys(Colors || {})
        const fill = colors.filter(data => ColorsTranslate[data]?.toLowerCase()?.includes(value?.toLowerCase()))
        const mapped = fill.map(data => ({ name: ColorsTranslate[data], value: data }))
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

        const fill = betObject.filter(d => d.name?.includes(value))
        const mapped = fill.map(d => ({ name: `${d.name} Safiras | ${d.length || 0} apostas em espera`, value: `${d.name}` }))
        return this.respond(mapped)
    }

    async blockCommands(value) {
        const data = await this.Database.Client.findOne({ id: this.client.user.id }, 'ComandosBloqueadosSlash')
        const bugs = data?.ComandosBloqueadosSlash || []
        const fill = bugs.filter(bug => bug.cmd?.toLowerCase()?.includes(value?.toLowerCase()) || bug.error?.toLowerCase()?.includes(value?.toLowerCase()))
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
        const fill = cmds.filter(cmdName => cmdName.name?.toLowerCase()?.includes(value?.toLowerCase()))
        const mapped = fill.map(cmdName => ({ name: cmdName.name, value: cmdName.name }))

        if (this.commandName !== 'saphire')
            if (!value?.length || 'todos os comandos'?.includes(value?.toLowerCase()))
                mapped.unshift({ name: 'Todos os comandos', value: 'all' })

        return this.respond(mapped)
    }

    translateLanguages(value) {
        const languages = Object.entries(Languages)
        const fill = languages.filter(([a, b]) => a?.includes(value?.toLowerCase()) || b?.toLowerCase()?.includes(value?.toLowerCase()))
        const mapped = fill.map(([_, b]) => ({ name: b, value: b }))
        return this.respond(mapped)
    }

    async balanceOptions(value) {

        const isStaff = this.client.admins?.includes(this.user.id)
        const options = [
            {
                name: 'Esconder só pra mim',
                value: 'hide'
            },
            {
                name: 'Reportar um erro/bug no meu dinheiro',
                value: 'report'
            }
        ]

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

        const fill = options.filter(data => data.name?.toLowerCase()?.includes(value?.toLowerCase()))
        return this.respond(fill)

    }

    async allUsers(value) {

        const users = this.client.allUsers
        if (!users || users.length === 0) return this.respond()

        const fill = users
            .filter(user => {
                return user?.username?.toLowerCase()?.includes(value?.toLowerCase())
                    || user?.id?.includes(value)
            })

        const mapped = fill
            .filter(x => x)
            .map(user => ({
                name: `${user.username} | ${user.id}`,
                value: user.id
            }))

        return this.respond(mapped)
    }

    view_wallpaper(value) {
        const backgrounds = Object.entries(Database.BgLevel)

        if (Database.BgLevel[value]) {
            const data = Database.BgLevel[value]
            return this.respond([{
                name: `${value} - (${data.Limit == -1 ? "Ilimitado" : data.Limit == 0 ? "Esgotado" : `+${data.Limit || 0}`}) ${data.Name}`,
                value
            }])
        }

        const mapped = backgrounds
            .map(([bgCode, d]) => ({
                name: `${bgCode} - (${d.Limit == -1 ? "Ilimitado" : d.Limit == 0 ? "Esgotado" : `${d.Limit ? `+${d.Limit}` : '+999'}`}) ${d.Name}`,
                value: bgCode
            }))
            .filter(data => data.name.toLowerCase().includes(value?.toLowerCase()))

        if (mapped.length > 1)
            mapped.unshift({
                name: 'Ver lista completa',
                value: 'full'
            })

        return this.respond(mapped)
    }

    async changeLevelBackground(value) {
        const userData = await this.Database.getUser(this.user.id)
        const clientData = await this.Database.Client.findOne({ id: this.client.user.id }, 'BackgroundAcess') || []
        const wallSetted = userData.Walls?.Set

        const userBackground = clientData?.BackgroundAcess?.includes(this.user.id)
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
                .filter(data => data.name?.toLowerCase()?.includes(value?.toLowerCase()))

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
        if (clientData?.BackgroundAcess?.includes(this.user.id)) return this.respond()

        const userData = await this.Database.getUser(this.user.id) || {}
        const userBackgrounds = userData.Walls?.Bg || []
        const backgrounds = Object.entries(this.Database.BgLevel || {})
        const walls = backgrounds
            .sort((a, b) => {
                const num = parseInt(a[0].slice(2, 5))
                const num2 = parseInt(b[0].slice(2, 5))
                return num - num2
            })
            .filter(bg =>
                !userBackgrounds?.includes(bg[0])
                && bg[0] !== 'bg0'
                && bg[1]?.Limit > 0
            ) || []

        const mapped = walls?.map(bg => {

            const limit = bg[1]?.Limit > 0 ? ` | Estoque: ${bg[1]?.Limit || 0}` : ''
            const nameData = `${bg[0]} - ${bg[1].Name} | ${bg[1].Price} Safiras${limit}`

            return { name: nameData, value: bg[0] }

        })
            .filter(data => data.name?.toLowerCase()?.includes(value?.toLowerCase())) || []

        return this.respond(mapped)
    }

    async levelOptions() {
        const arr = [{ name: 'Esconder mensagem só para mim', value: 'hide' }]

        if (this.client.admins?.includes(this.user.id))
            arr.push({ name: 'Usuários que possuem acesso aos Backgrounds', value: 'list' })

        return this.respond(arr)
    }

    respond(arrayData = []) {

        if (arrayData.length > 25) arrayData.length = 25

        const mappedArray = arrayData.map(data => ({
            name: data?.name?.limit('AutocompleteName'),
            value: data?.value?.constructor === Number
                ? data?.value
                : data?.value.limit('AutocompleteValue')
        })).filter(i => i)

        return this.interaction.respond(mappedArray)
    }
}
