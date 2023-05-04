import { Base, SaphireClient as client, Database } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'
import { Config as config } from '../../util/Constants.js'
import { ButtonStyle, ChannelType, PermissionFlagsBits } from 'discord.js'
import moment from 'moment'
import cantadasModal from './modals/cantadas/cantadas.modal.js'
import managerReminder from '../../functions/update/reminder/manager.reminder.js'
import checkerQuiz from './buttons/quiz/checker.quiz.js'

export default class ModalInteraction extends Base {
    constructor(interaction) {
        super()
        this.interaction = interaction
        this.customId = interaction.customId
        this.fields = interaction.fields
        this.user = interaction.user
        this.guild = interaction.guild
        this.channel = interaction.channel
        this.member = interaction.member
        this.message = interaction.message
        this.data = {}
    }

    submitModalFunctions = async () => {

        if (this.customId.includes('channel')) return this.ChannelRedirect(this)
        if (this.customId.includes('reportBalance')) return this.reportBalance(this)
        if (this.customId.includes('fanart')) return this.addFanart(this)
        if (this.customId.includes('rather_')) return this.adminEditRather(this)
        if (/\d{18,}/.test(this.customId) && !this.customId.startsWith('{')) return import('./modals/wordleGame/wordleGame.modal.js').then(data => data.default(this))

        const ModalInteractionFunctions = {
            BugModalReport: [this.BugModalReport, this],
            editProfile: [this.editProfile, this],
            logomarcaReporter: [this.logomarcaReporter, this],
            balance: [this.balanceOptions, this],
            indicationsLogomarca: [this.indicateLogomarca, this],
            rather: [this.vocePrefere, this],
            ratherEdit: [this.vocePrefereEdit, this],
            animeIndicationsEdit: [this.animeIndicationsEdit, this],
            animeIndications: [this.animeIndications, this],
            notice: [this.announce, this],
            transactionsModalReport: [this.transactionsModalReport],
            botSugest: [this.botSugest],
            serverSugest: [this.serverSugest],
            serverReport: [this.serverReport],
            cantada: [cantadasModal, this],
            anime: [this.editAnime, this],
            saphireGlobalChat: [this.globalChat, this],
        }[this.customId]

        if (ModalInteractionFunctions)
            return ModalInteractionFunctions[0](ModalInteractionFunctions[1])

        if (this.customId.startsWith('{')) {
            this.customId = JSON.parse(this.customId)

            if (this.customId?.c === 'reminder')
                return managerReminder.edit(this.interaction, this.customId?.reminderId)

            if (this.customId.c === 'anime')
                return this.editAnime(this)

            if (this.customId.c.startsWith('newQuiz'))
                return checkerQuiz(this.interaction, { src: this.customId.c })
        }

        return await this.interaction.reply({
            content: `${e.Info} | Este modal não possui uma função correspondente a ele.`,
            ephemeral: true
        })
    }

    async globalChat({ interaction, user, guild, fields }) {

        const content = fields.getTextInputValue('content') || null

        if (!content)
            return await interaction.reply({
                content: `${e.DenyX} | Nenhuma mensagem foi encontrada.`,
                ephemeral: true
            })

        const messageObject = {
            userId: user.id,
            userTag: user.tag,
            userAvatar: user.avatarURL(),
            guildId: guild.id,
            guildName: guild.name,
            guildAvatar: guild.iconURL(),
            content: content
        }

        await Database.Cache.Chat.push("Global", messageObject)
        return await interaction.reply({
            content: `${e.Check} | Sua mensagem foi enviada. Ela aparecerá no chat global dentro de 5 segundos.`,
            ephemeral: true
        })
    }

    async editAnime({ interaction, message, fields, customId }) {

        if (customId.src === 'edit') {
            const name = fields.getTextInputValue('name') || null
            const anime = fields.getTextInputValue('anime') || null
            const type = fields.getTextInputValue('type') || null

            const embed = message?.embeds[0]?.data
            embed.fields[1].value = name
            embed.fields[2].value = anime
            embed.fields[3].value = type
            return await interaction.update({ embeds: [embed] }).catch(() => { })
        }

        if (customId.src === 'correct') {
            const name = fields.getTextInputValue('name') || null
            const anime = fields.getTextInputValue('anime') || null

            const embed = message?.embeds[0]?.data

            if (client.animes.find(an => an?.name?.toLowerCase() === name.toLowerCase())
                || client.animes.filter(an => an?.type === 'anime').find(an => an?.name?.toLowerCase() === name.toLowerCase())
            )
                return await interaction.reply({ content: `${e.Deny} | Alteração inválida. Nome/Anime já existe no banco de dados.` }).catch(() => { })

            const type = {
                anime: 'Anime',
                male: 'Personagem Masculino',
                female: 'Personagem Feminino',
                others: 'Outros'
            }[fields.getTextInputValue('type')] || 'Não identificado'

            const sendedFor = embed.fields.at(-1).value

            embed.fields = [{ name: '📝 Tipo do Elemento', value: type }]

            if (type !== 'Anime')
                embed.fields.push({
                    name: '⭐ Nome do Personagem/Anime',
                    value: `**${name || "? Not Identified"}** do anime **${anime || "? Not Identified"}**`
                })
            else embed.fields.push({ name: '⭐ Nome do Anime', value: anime || "? Not Identified" })

            embed.fields.push({ name: '👤 Enviado por', value: sendedFor })

            await Database.Anime.findOneAndUpdate(
                { id: customId.id },
                { $set: { name, anime, type: fields.getTextInputValue('type') } },
                { new: true }
            ).then(doc => client.animes[client.animes.findIndex(an => an.id == customId.id)] = doc)

            return await interaction.update({ embeds: [embed] })
        }

        return await interaction.reply({
            content: `${e.Deny} | Sub-comando não encontrado. #9877987`
        })
    }

    async announce({ interaction, user, guild, member, fields }) {

        // const guildData = await Database.Guild.findOne({ id: guild.id }, "announce")
        const guildData = await Database.getGuild(guild.id)
        const channel = await guild.channels.fetch(guildData?.announce?.channel || "undefined").catch(() => null)
        const notificationRole = await guild.roles.fetch(guildData?.announce?.notificationRole || "undefined").catch(() => null)
        const allowedRole = await guild.roles.fetch(guildData?.announce?.allowedRole || "undefined").catch(() => null)

        if (!channel || !notificationRole || !allowedRole)
            return await interaction.reply({
                content: `${e.Deny} | A configuração deste comando não está completa ou desatualizada. Por favor, reconfigure usando o mesmo comando ou pedindo a um administrador.`,
                ephemeral: true
            })

        if (!member.roles.cache.has(allowedRole.id) && !member.permissions.has(PermissionFlagsBits.Administrator))
            return await interaction.reply({
                content: `${e.Deny} | Você não tem o cargo necessário para publicar notícias. (${notificationRole})`,
                ephemeral: true
            })

        const title = fields.getTextInputValue('title') || null
        const description = fields.getTextInputValue('notice') || null
        const font = fields.getTextInputValue('font') || null
        const thumbnail = fields.getTextInputValue('thumbnail') || null
        const image = fields.getTextInputValue('image') || null

        if (!title || !description || !font)
            return await interaction.reply({
                content: `${e.Deny} | As informações não foram passadas corretamentes.`,
                ephemeral: true
            })

        if (!font.isURL())
            return await interaction.reply({
                content: `${e.Deny} | O campo de "Fonte" repassado não é um link válido.`,
                ephemeral: true
            })

        if (thumbnail && !thumbnail?.isURL())
            return await interaction.reply({
                content: `${e.Deny} | O campo de "Thumbnail" repassado não é um link válido.`,
                ephemeral: true
            })

        if (image && !image?.isURL())
            return await interaction.reply({
                content: `${e.Deny} | O campo de "Imagem" repassado não é um link válido.`,
                ephemeral: true
            })

        const embeds = [{
            color: client.blue,
            title,
            url: font,
            description,
            thumbnail: { url: thumbnail },
            image: { url: image },
            fields: [
                {
                    name: '👤 Autor(a)',
                    value: `${user.tag} - \`${user.id}\``
                }
            ]
        }]

        const components = [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Ver na integra',
                    emoji: '📎',
                    style: ButtonStyle.Link,
                    url: font
                },
                {
                    type: 2,
                    emoji: e.Notification,
                    style: ButtonStyle.Primary,
                    custom_id: JSON.stringify({ c: 'anunciar', src: 'notification' })
                }
            ]
        }]

        return await channel?.send({
            content: `${e.Notification} ${notificationRole}`,
            embeds,
            components
        })
            .then(async message => await interaction.reply({
                content: `${e.Check} | A sua notícia foi publicada com sucesso.`,
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: 'Ver Notícia',
                                emoji: '📎',
                                style: ButtonStyle.Link,
                                url: message.url
                            }
                        ]
                    }
                ],
                ephemeral: true
            }))
            .catch(async err => await interaction.reply({
                content: `${e.Deny} | Não foi possível publicar a notícia.\n${e.Bug} | \`${err}\``,
                ephemeral: true
            }))
    }

    async addFanart({ interaction, fields }) {

        const imageUrl = fields.getTextInputValue('imageURL')
        const imageName = fields.getTextInputValue('imageName')
        const socialUrl = fields.getTextInputValue('socialURL')
        const userId = JSON.parse(this.customId)?.src
        const user = await this.client.users.fetch(userId).catch(() => null)

        if (!user)
            return await interaction.reply({
                content: `${e.Deny} | Usuário não encontrado.`,
                ephemeral: true
            })

        const fanarts = await this.Database.Fanart.find({}) || []
        const allIds = fanarts?.map(fan => fan?.id) || []

        if (fanarts.find(fan => fan?.url === imageUrl))
            return await interaction.reply({
                content: `${e.Deny} | Essa fanart já existe no banco de dados.`,
                ephemeral: true
            })

        if (fanarts.find(fan => fan?.name === imageName))
            return await interaction.reply({
                content: `${e.Deny} | Uma fanart com esse nome já existe no banco de dados.`,
                ephemeral: true
            })

        let nextId = 0
        let control = 0

        do {

            if (!allIds.includes(control)) {
                nextId = control
                control = true
                break;
            }

            control++
            continue

        } while (control !== true)

        return this.Database.Fanart.create({
            id: nextId,
            name: imageName,
            socialUrl: socialUrl,
            url: imageUrl,
            userId: user.id
        })
            .then(async doc => {
                client.fanarts.push(doc)
                return await interaction.reply({
                    content: `${e.Check} | Fanart salva com sucesso.`,
                    ephemeral: true
                })
            })
            .catch(async error => await interaction.reply({
                content: `${e.Deny} | Não foi possível salvar essa Fanart.\n${e.Warn} | \`${error}\``,
                ephemeral: true
            }))

    }

    async reportBalance({ interaction, fields, user }) {

        const report = fields.getTextInputValue('report')

        const embed = {
            color: client.blue,
            title: `📑 Balance Report`,
            description: report,
            fields: [
                {
                    name: '👤 Usuário',
                    value: `${user.tag} - \`${user.id}\``
                }
            ]
        }

        const channel = await client.channels.fetch(config.balaceReportChannelId).catch(() => null)

        const linkButton = {
            type: 1,
            components: [
                {
                    type: 2,
                    label: channel?.guild?.name || 'Servidor Principal',
                    url: config.MoonServerLink,
                    style: ButtonStyle.Link
                }
            ]
        }

        if (!channel) return notSend()

        return channel?.send({ embeds: [embed] })
            .then(async () => await interaction.reply({
                content: `${e.Check} | O seu report foi enviado com sucesso.\n${e.Info} | Caso queira acompanhar ou se comunicar com a staff, por favor, entre no meu servidor clicando no botão abaixo.`,
                components: [linkButton],
                ephemeral: true
            }))
            .catch(() => notSend())

        async function notSend() {
            return await interaction.reply({
                content: `${e.Deny} | Não foi possível obter o canal de envio. Por favor, contacte algum membro da minha staff.`,
                components: [linkButton],
                ephemeral: true
            })
        }
    }

    async ChannelRedirect({ interaction, customId }) {

        const channelData = JSON.parse(customId)
        const method = channelData?.method

        const execute = {
            editName: 'editChannelName',
            clone: 'channelClone',
            topic: 'channelTopic'
        }[method]

        if (!execute)
            return await interaction.reply({
                content: `${e.Deny} | SubModalInteractionFunction not found.`,
                ephemeral: true
            })

        return this[execute](this)
    }

    async channelTopic({ interaction, fields, user, customId, guild }) {

        const newTopic = fields.getTextInputValue('channelTopic')
        const channelIdData = JSON.parse(customId)
        const channelId = channelIdData?.id

        if (!channelId)
            return await interaction.reply({
                content: `${e.Deny} | Não foi possível localizar o ID do canal para editar o tópico.`,
                ephemeral: true
            })

        const channel = guild.channels.cache.get(channelId)

        if (!channel)
            return await interaction.reply({
                content: `${e.Deny} | Eu não encontrei o canal selecionado.`,
                ephemeral: true
            })

        const fail = await channel.edit({
            topic: newTopic,
            reason: `${user.tag} editou o tópico deste canal.`
        })
            .catch(err => err.code)

        if (fail.constructor === Number) {

            const content = {
                10003: `${e.Deny} | Este canal é desconhecido. Por favor, tente em outro canal.`,
                50024: `${e.Deny} | Essa ação não pode ser executada nesse tipo de canal.`
            }[fail] || `${e.Deny} | Não foi possível editar o tópico do canal ${channel}.`

            return await interaction.reply({ content: content, ephemeral: true })
        }

        return await interaction.reply({
            content: `${e.Check} | O tópico do canal ${channel} foi editado com sucesso.`,
            ephemeral: true
        })
    }

    async channelClone({ interaction, fields, user, customId, guild }) {

        const newName = fields.getTextInputValue('channelName')
        const channelIdData = JSON.parse(customId)
        const channelId = channelIdData?.id

        if (!channelId)
            return await interaction.reply({
                content: `${e.Deny} | Não foi possível localizar o ID do canal para efetuar a clonagem.`,
                ephemeral: true
            })

        const channel = guild.channels.cache.get(channelId)

        if (!channel)
            return await interaction.reply({
                content: `${e.Deny} | Eu não encontrei o canal selecionado.`,
                ephemeral: true
            })

        const fail = await channel.clone({
            name: newName,
            reason: `${user.tag} clonou este canal.`
        })
            .catch(err => err.code)

        if (fail.constructor === Number) {

            const content = {
                10003: `${e.Deny} | Este canal é desconhecido. Por favor, tente em outro canal.`,
                50024: `${e.Deny} | Essa ação não pode ser executada nesse tipo de canal.`
            }[fail] || `${e.Deny} | Não foi possível clonar o canal ${channel}.`

            return await interaction.reply({ content: content, ephemeral: true })
        }

        return await interaction.reply({
            content: `${e.Check} | O canal ${channel} foi clonado com sucesso. Aqui está ele: ${fail}`,
            ephemeral: true
        })
    }

    async editChannelName({ interaction, fields, user, customId, guild }) {

        const newName = fields.getTextInputValue('channelName')
        const channelIdData = JSON.parse(customId)
        const channelId = channelIdData?.id

        if (!channelId)
            return await interaction.reply({
                content: `${e.Deny} | Não foi possível localizar o ID do canal para a edição do nome.`,
                ephemeral: true
            })

        const channel = guild.channels.cache.get(channelId)

        if (!channel)
            return await interaction.reply({
                content: `${e.Deny} | Eu não encontrei o canal selecionado.`,
                ephemeral: true
            })

        const fail = await channel.setName(newName, `${user.tag} editou o nome deste canal`)
            .catch(err => err.code)

        if (fail.constructor === Number) {

            const content = {
                10003: `${e.Deny} | Este canal é desconhecido. Por favor, tente em outro canal.`,
                50024: `${e.Deny} | Essa ação não pode ser executada nesse tipo de canal.`
            }[fail] || `${e.Deny} | Não foi possível editar o nome do canal ${channel}.`

            return await interaction.reply({ content: content, ephemeral: true })
        }

        const channelDataName = {
            [ChannelType.GuildCategory]: 'da categoria',
            [ChannelType.GuildVoice]: 'do canal de voz',
            [ChannelType.GuildText]: 'do canal de texto'
        }[channel.type] || 'do canal'

        return await interaction.reply({
            content: `${e.Check} | O nome ${channelDataName} ${channel} foi editado com sucesso.`,
            ephemeral: true
        })
    }

    async indicateLogomarca({ interaction, fields, user }) {

        const marca = fields.getTextInputValue('marca')
        const logos = Database.Logomarca

        if (logos.find(lg => lg.answers.find(name => name.toLowerCase().includes(marca.toLowerCase()))))
            return await interaction.reply({
                content: `${e.Deny} | Está logomarca já existe no banco de dados.`,
                components: [
                    {
                        type: 1,
                        components: [{
                            type: 2,
                            label: 'Tentar outra marca',
                            custom_id: JSON.stringify({ c: 'logomarca', src: 'again' }),
                            style: ButtonStyle.Primary
                        }]
                    }
                ],
                ephemeral: true
            })

        const channel = await client.channels.fetch(config.logomarcaIndicateChannelId).catch(() => null)

        if (!channel)
            return await interaction.reply({
                content: `${e.Deny} | Eu não achei o canal de envio`,
                ephemeral: true
            })

        return channel.send({
            embeds: [{
                color: client.blue,
                title: '💭 Nova Indicação de Logomarca',
                fields: [
                    {
                        name: '👤 Usuário',
                        value: `${user.tag} - \`${user.id}\``
                    },
                    {
                        name: '✍ Indicação ou Indicações',
                        value: `\`${marca}\``
                    }
                ]
            }]
        })
            .then(async () => {
                return await interaction.reply({
                    content: `${e.Check} | Sua indicação de logomarca foi enviada com sucesso para a minha equipe de designers.`,
                    ephemeral: true
                })
            })
            .catch(async () => {
                return await interaction.reply({
                    content: `${e.Deny} | Ocorreu um erro ao enviar sua indicação de logomarca.`,
                    ephemeral: true
                })
            })

    }

    async logomarcaReporter({ interaction, fields, user, client }) {

        const bug = fields.getTextInputValue('bug')
        const description = fields.getTextInputValue('description')

        const sended = await client.sendWebhook(
            process.env.WEBHOOK_ERROR_REPORTER,
            {
                avatarURL: 'https://media.discordapp.net/attachments/893361065084198954/1017604411603820575/questao1.png?width=484&height=484',
                username: '[Saphire] QUIZ | Logomarca Reporter',
                embeds: [{
                    color: client.red,
                    title: '💭 Error Reporter | Logomarca',
                    description: description,
                    fields: [
                        {
                            name: '✍ Erro reportado',
                            value: bug
                        },
                        {
                            name: '👤 Usuário',
                            value: `${user.tag} - \`${user.id}\``
                        }
                    ]
                }],
                fetchReply: true
            }
        ).catch(() => null)

        if (!sended)
            return await interaction.reply({
                content: `${e.Deny} | Não foi possível concluir o envio do seu report.`,
                ephemeral: true
            })

        return await interaction.reply({
            content: `${e.Check} | O seu report foi enviado com sucesso. Muito obrigado por me ajudar ❤`,
            ephemeral: true
        })

    }

    async animeIndications({ interaction, fields, user, Database }) {

        const animeName = fields.getTextInputValue('name')
        const allAnimes = await Database.animeIndications() || []
        const alreadyExist = allAnimes.find(anime => anime?.name?.toLowerCase() === animeName?.toLowerCase())

        if (alreadyExist)
            return await interaction.reply({
                content: `${e.Deny} | O anime \`${animeName}\` já existe no banco de dados.`,
                ephemeral: true
            })

        return await fetch(
            `https://kitsu.io/api/edge/anime?filter[text]=${animeName
                .toLowerCase()
                .replace(/[ãâáàä]/gi, 'a')
                .replace(/[êéèë]/gi, 'e')
                .replace(/[îíìï]/gi, 'i')
                .replace(/[õôóòö]/gi, 'o')
                .replace(/[ûúùü]/gi, 'u')
                .replace(/[ç]/gi, 'c')
            }`,
            {
                method: "GET",
                headers: {
                    Accept: 'application/vnd.api+json',
                    'Content-Type': 'application/vnd.api+json'
                }
            })
            .then(res => res.json())
            .then(result => {
                if (!result || !result?.data || !result?.data?.length)
                    return interaction.reply({
                        content: `${e.Deny} | Eu não achei nenhum anime com a sua indicação.`,
                        ephemeral: true
                    }).catch(() => { })

                return sendIndication()
            })
            .catch(() => {
                return interaction.reply({
                    content: `${e.Deny} | O anime indicado não existe ou eu não achei ele na lista de animes da Kitsu.`,
                    ephemeral: true
                })
            })

        async function sendIndication() {

            const embed = {
                color: client.blue,
                title: '💭 Nova Indicação',
                description: 'Preencha os campos com todas as TAG\'s que se encaixam ao anime indicado.',
                fields: [
                    {
                        name: '📺 Anime',
                        value: animeName
                    },
                    {
                        name: '🧩 Gêneros',
                        value: `${e.Loading} Esperando seleção de gêneros...`
                    },
                    {
                        name: '🏷️ Tags (1)',
                        value: `${e.Loading} Esperando seleção de tags...`
                    },
                    {
                        name: '🏷️ Tags (2)',
                        value: `${e.Loading} Esperando seleção de tags...`
                    },
                    {
                        name: '👥 Público Alvo',
                        value: `${e.Loading} Esperando seleção de público alvo...`

                    }
                ],
                footer: { text: user.id }
            }

            const optionsGender = [
                {
                    label: 'Ação',
                    description: 'Adrenalina, cenas de gelar o coração',
                    emoji: '🤸‍♂️',
                    value: 'Ação'
                },
                {
                    label: 'Aventura',
                    description: 'Viagens, conhecimento e coisas novas',
                    emoji: '🏂',
                    value: 'Aventura'
                },
                {
                    label: 'Comédia',
                    description: 'Risadas, coisas engraçadas e divertidas',
                    emoji: '😂',
                    value: 'Comédia'
                },
                {
                    label: 'Drama',
                    description: 'História ou cenas que mexe com o emocional',
                    emoji: '😭',
                    value: 'Drama'
                },
                {
                    label: 'Ecchi/Hentai',
                    description: 'Conteúdo não recomendado para menores de 18 anos',
                    emoji: '🔞',
                    value: 'Ecchi/Hentai'
                },
                {
                    label: 'Fantasia',
                    description: 'Magia, poderes, coisas não reais',
                    emoji: '🧙‍♂️',
                    value: 'Fantasia'
                },
                {
                    label: 'Terror',
                    description: 'Medo, susto, fantasmas, coisas horriveis',
                    emoji: '😱',
                    value: 'Terror'
                },
                {
                    label: 'Robôs',
                    description: 'Algo bem pro futuro, robos e tecnologia',
                    emoji: '🤖',
                    value: 'Robôs'
                },
                {
                    label: 'Musical',
                    description: 'Canto, melodia e música',
                    emoji: '🎶',
                    value: 'Musical'
                },
                {
                    label: 'Psicológico',
                    description: 'Conteúdo refente ao psicológico humano',
                    emoji: '🧠',
                    value: 'Psicológico'
                },
                {
                    label: 'Romance',
                    description: 'Amor, timidez e borboletas no estomago',
                    emoji: '💏',
                    value: 'Romance'
                },
                {
                    label: 'Sci-Fi / Ficção Científica',
                    description: 'Nada aqui é real, é tudo uma ficção',
                    emoji: '🧪',
                    value: 'Sci-Fi'
                },
                {
                    label: 'Vida Cotidiana',
                    description: 'Um anime que qualquer um poderia viver',
                    emoji: '👨‍💼',
                    value: 'Vida Cotidiana'
                },
                {
                    label: 'Esportes',
                    description: 'Desde futebol, até ping-pong',
                    emoji: '⚽',
                    value: 'Esportes'
                },
                {
                    label: 'Supernatural',
                    description: 'Não é a série, é conteúdo supernatural',
                    emoji: '👻',
                    value: 'Supernatural'
                },
                {
                    label: 'Suspense',
                    description: 'Animes onde o suspense ataca a ansiedade',
                    emoji: '🕵️‍♂️',
                    value: 'Suspense'
                },
                {
                    label: 'Mistério',
                    description: 'Animes onde tudo é um mistério',
                    emoji: '🔍',
                    value: 'Mistério'
                },
                {
                    label: 'Luta',
                    description: 'Lutas e brigas faz parte da história',
                    emoji: '🥊',
                    value: 'Luta'
                }
            ]

            const optionsTags = [
                {
                    label: 'Artes Marciais',
                    description: 'Envolve personagens que utilizam técnicas de artes marciais',
                    value: 'Artes Marciais'
                },
                {
                    label: 'Avant-Garde',
                    description: 'Apresentam temas experimentais, inovadores e filosóficos',
                    value: 'Avant-Garde'
                },
                {
                    label: 'Boys Love (BL)',
                    description: 'A história gira em torno de um romance homoafetivo entre garotos.',
                    value: 'Boys Love (BL)'
                },
                {
                    label: 'Girls Love (GL)',
                    description: 'A história gira em torno de um romance homoafetivo entre garotas.',
                    value: 'Girls Love (GL)'
                },
                {
                    label: 'Cyberpunk',
                    description: 'Apresenta um mundo em que a sociedade está mais arraigada à tecnologia.',
                    value: 'Cyberpunk'
                },
                {
                    label: 'Faroeste',
                    description: 'Acontece em um lugar semelhante ao Velho-Oeste americano.',
                    value: 'Faroeste'
                },
                {
                    label: 'Isekai',
                    description: 'Animes onde a história ocorre em outro mundo',
                    value: 'Isekai'
                },
                {
                    label: 'Jogos',
                    description: 'São focados em jogos eletrônicos, RPG, etc.',
                    value: 'Jogos'
                },
                {
                    label: 'Histórico',
                    description: 'Em sua maioria contam a história de um Japão da época feudal.',
                    value: 'Histórico'
                },
                {
                    label: 'Policial/Investigação',
                    description: 'Focado em ações policiais/investigativas.',
                    value: 'Policial/Investigação'
                },
                {
                    label: 'Pós-Apocalíptico',
                    description: 'Focado em um mundo depois de um apocalípse',
                    value: 'Pós-Apocalíptico'
                },
                {
                    label: 'Slice-of-life',
                    description: 'É centrado no dia a dia de pessoas comuns.',
                    value: 'Slice-of-life'
                },
                {
                    label: 'Sobrenatural',
                    description: 'Animes onde o sobrenatural é presente',
                    value: 'Sobrenatural'
                },
                {
                    label: 'Superpoderes',
                    description: 'Animes onde os personagens possuem superpoderes',
                    value: 'Superpoderes'
                },
                {
                    label: 'Vida escolar',
                    description: 'Geralmente os personagens vão a escola.',
                    value: 'Vida escolar'
                },
                {
                    label: 'Ecchi/Hentai',
                    description: 'O foco são cenas sexualmente provocativas.',
                    value: 'Ecchi'
                },
                {
                    label: 'Harém',
                    description: 'O personagem principal possui um harém.',
                    value: 'Harém'
                },
                {
                    label: 'Crianças',
                    description: 'Contém crianças neste anime',
                    value: 'Crianças'
                },
                {
                    label: 'Viagem',
                    description: 'Ocorrem viagens ao desenrolar da história',
                    value: 'Viagem'
                },
                {
                    label: 'Flash Black',
                    description: 'Ocorre muito flash black ao decorrer do anime',
                    value: 'Flash Black'
                },
                {
                    label: 'Fuga/Perseguição',
                    description: 'O/A protagonista é alguém que está sob constante fuga/perseguição',
                    value: 'Fuga/Perseguição'
                },
                {
                    label: 'Battle Royale',
                    description: 'Luta em uma arena ou algo parecido é presente nesta história',
                    value: 'Battle Royale'
                },
                {
                    label: 'Bullying',
                    description: 'O anime fala/trata sobre bullying',
                    value: 'Bullying'
                },
                {
                    label: 'Parkour',
                    description: 'O esporte parkour é praticado por aqui',
                    value: 'Parkour'
                },
                {
                    label: 'Tortura',
                    description: 'Esse anime contém cenas de tortura',
                    value: 'Tortura'
                }
            ]

            const optionsTags2 = [
                {
                    label: 'Agricultura/Natureza',
                    description: 'O cuidado com a natureza é um abordado',
                    value: 'Agricultura/Natureza'
                },
                {
                    label: 'Vida Familiar',
                    description: 'Temas como familia é presente na história',
                    value: 'Vida Familiar'
                },
                {
                    label: 'Depressão/Ansiedade',
                    description: 'Personagens sofre destes problemas',
                    value: 'Depressão/Ansiedade'
                },
                {
                    label: 'Carros/Motos/Aviões',
                    description: 'Os personagens se envolvem no ramo automobilístico',
                    value: 'Carros/Motos/Aviões'
                },
                {
                    label: 'Guerra',
                    description: 'O anime acontece no contexto de uma guerra',
                    value: 'Guerra'
                },
                {
                    label: 'Religião',
                    description: 'A religião é abordada durante a história',
                    value: 'Religião'
                },
                {
                    label: 'Política',
                    description: 'O governo ou membros dele tem um pedaço da história',
                    value: 'Política'
                },
                {
                    label: 'Médico/Medicina',
                    description: 'O ramo hospitalar é bem comúm aqui',
                    value: 'Médico/Medicina'
                }
            ]

            for (let cat of [...optionsTags, ...optionsTags2])
                cat.emoji = '🏷️'

            const selectMenuGender = {
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'animeSuggestionsGender',
                    placeholder: 'Selecionar Gêneros',
                    min_values: 0,
                    max_values: optionsGender.length,
                    options: optionsGender
                }]
            }

            const selectMenuTags = {
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'animeSuggestionsTags',
                    placeholder: 'Selecionar Tags (1)',
                    min_values: 0,
                    max_values: optionsTags.length,
                    options: optionsTags
                }]
            }

            const selectMenuTags2 = {
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'animeSuggestionsTags2',
                    placeholder: 'Selecionar Tags (2)',
                    min_values: 0,
                    max_values: optionsTags2.length,
                    options: optionsTags2
                }]
            }

            const selectMenuMatchPublic = {
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'animeSuggestionsMatchPublic',
                    placeholder: 'Selecionar Público Alvo',
                    min_values: 0,
                    max_values: 5,
                    options: [
                        {
                            label: 'Shōjo',
                            description: 'Animes focado ao público feminino jovem.',
                            emoji: '👧',
                            value: 'Shōjo'
                        },
                        {
                            label: 'Josei',
                            description: 'Foca-se em histórias e experiências de mulheres japonesas.',
                            emoji: '🎎',
                            value: 'Josei'
                        },
                        {
                            label: 'Shounen',
                            description: 'Animes direcionados ao público masculino jovem.',
                            emoji: '👱‍♂️',
                            value: 'Shounen'
                        },
                        {
                            label: 'Seinen',
                            description: 'Animes com assuntos mais sérios e pesados.',
                            emoji: '👓',
                            value: 'Seinen'
                        },
                        {
                            label: 'Kodomo',
                            description: 'Animes com assuntos infantis',
                            emoji: '👶',
                            value: 'Kodomo'
                        }
                    ]
                }]
            }

            const buttons = {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Enviar',
                        emoji: '📨',
                        custom_id: JSON.stringify({ c: 'anime', src: 'send' }),
                        style: ButtonStyle.Success,
                        disabled: true,
                    },
                    {
                        type: 2,
                        label: 'Cancelar',
                        emoji: '❌',
                        custom_id: JSON.stringify({ c: 'anime', src: 'cancel' }),
                        style: ButtonStyle.Danger
                    }
                ]
            }

            return await interaction.reply({
                embeds: [embed],
                components: [buttons, selectMenuGender, selectMenuTags, selectMenuTags2, selectMenuMatchPublic]
            })
        }

    }

    vocePrefere = async ({ interaction, fields, user, guild }) => {

        const channel = await client.channels.fetch(config.vocePrefereChannel).catch(() => null)

        if (!channel)
            return await interaction.reply({
                content: `${e.Deny} | Canal de sugestões do jogo não encontrado.`,
                ephemeral: true
            })

        const questionOne = fields.getTextInputValue('questionOne')
        const questionTwo = fields.getTextInputValue('questionTwo')

        const embed = {
            color: client.blue,
            title: `${e.QuestionMark} Sugestão de Pergunta`,
            fields: [
                {
                    name: '👤 Usuário',
                    value: `${user.tag} - \`${user.id}\`\nEnviado do servidor ${guild.name} \`${guild.id}\``
                },
                {
                    name: 'Pergunta 1',
                    value: questionOne
                },
                {
                    name: 'Pergunta 2',
                    value: questionTwo
                }
            ],
            footer: { text: user.id }
        }

        const selectMenuObject = {
            type: 1,
            components: [{
                type: 3,
                custom_id: 'vocePrefere',
                placeholder: 'Admin Options',
                options: [
                    {
                        label: 'Aceitar sugestão',
                        emoji: e.Check,
                        description: 'Salvar esta sugestão no banco de dados do jogo',
                        value: 'accept',
                    },
                    {
                        label: 'Recusar sugestão',
                        emoji: e.Deny,
                        description: 'Recusar e deletar esta sugestão',
                        value: 'deny'
                    },
                    {
                        label: 'Editar sugestão',
                        emoji: '✍',
                        description: 'Editar o conteúdo da pergunta',
                        value: 'edit'
                    }
                ]
            }]
        }

        const sended = await channel.send({ embeds: [embed], components: [selectMenuObject] }).catch(() => null)

        return sended
            ? await interaction.reply({
                content: `${e.Check} | Sua sugestão foi enviada com sucesso!`,
                embeds: [embed],
                ephemeral: true
            })
            : await interaction.reply({
                content: `${e.Deny} | Não foi possível completar o envio. ~Motivo: Desconhecido`,
                ephemeral: true
            })
    }

    animeIndicationsEdit = async ({ interaction, fields, user, message }) => {

        if (!message || !message?.embeds) return

        const { embeds } = message
        const embed = embeds[0]?.data

        if (!embed)
            return await interaction.update({
                content: `${e.Deny} | Embed não encontrada`,
                components: []
            })

        const name = fields.getTextInputValue('name')

        embed.fields[0] = {
            name: '📺 Anime - (Editado)',
            value: name
        }

        return await interaction.update({ embeds: [embed] }).catch(() => { })
    }

    vocePrefereEdit = async ({ interaction, fields, user, message }) => {

        if (!message || !message?.embeds) return

        const { embeds } = message
        const embed = embeds[0]?.data

        if (!embed)
            return await interaction.update({
                content: `${e.Deny} | Embed não encontrada`,
                components: []
            })

        const questionOne = fields.getTextInputValue('questionOne')
        const questionTwo = fields.getTextInputValue('questionTwo')

        embed.fields[3] = {
            name: `(P1) Editado por ${user.tag}`,
            value: questionOne
        }

        embed.fields[4] = {
            name: `(P2) Editado por ${user.tag}`,
            value: questionTwo
        }

        return await interaction.update({ embeds: [embed] }).catch(() => { })
    }

    adminEditRather = async ({ interaction, fields, message }) => {

        const { embeds, components } = message
        const embed = embeds[0]?.data

        if (!embed)
            return await interaction.update({
                content: `${e.Deny} | Embed não encontrada`,
                components: []
            })

        const questionOne = fields.getTextInputValue('questionOne')
        const questionTwo = fields.getTextInputValue('questionTwo')

        embed.fields[3] = {
            name: `(P1) Editada`,
            value: questionOne
        }

        embed.fields[4] = {
            name: `(P2) Editada`,
            value: questionTwo
        }

        const componentsJSON = components[0].toJSON()
        const objectComponents = componentsJSON.components

        objectComponents[0].style = ButtonStyle.Primary

        objectComponents[2] = !this.client.staff.includes(this.user.id)
            ? {
                type: 2,
                style: ButtonStyle.Success,
                label: 'Solicitar alteração',
                custom_id: JSON.stringify({ c: 'redit', src: 'request' })
            }
            : {
                type: 2,
                style: ButtonStyle.Success,
                label: 'Confirmar',
                custom_id: JSON.stringify({ c: 'redit', src: 'confirm' })
            }

        return await interaction.update({ embeds: [embed], components: [componentsJSON] }).catch(() => { })
    }

    balanceOptions = async ({ interaction, guild, fields, user }) => {

        if (!client.admins.includes(user.id))
            return await interaction.reply({
                content: `${e.Deny} | Você não faz parte da equipe administrativa.`,
                ephemeral: true
            })

        const field = fields.fields.first()
        const value = parseInt(field.value)
        const customId = field.customId
        const customIdData = customId.split('_')
        const userId = customIdData[0]
        const method = customIdData[1]
        const targetUser = await client.users.fetch(userId).catch(() => null)
        const moeda = await guild.getCoin()

        if (!targetUser)
            return await interaction.reply({
                content: `${e.Deny} | Usuário não encontrado.`,
                ephemeral: true
            })

        if (isNaN(value))
            return await interaction.reply({
                content: `${e.Deny} | O valor inserido não é um número.`,
                ephemeral: true
            })

        const dataMethod = {
            add: {
                mongoose: {
                    $inc: {
                        Balance: value
                    },
                    $push: {
                        Transactions: {
                            $each: [{
                                time: `${Date.format(0, true)}`,
                                data: `${e.Admin} Um administrador adicionou ${value} Safiras`
                            }],
                            $position: 0
                        }
                    }
                },
                response: `adicionou **${value?.currency()} ${moeda}** para ${targetUser?.tag || 'Not found'} \`${targetUser?.id || 0}\``
            },
            remove: {
                mongoose: {
                    $inc: {
                        Balance: -value
                    },
                    $push: {
                        Transactions: {
                            $each: [{
                                time: `${Date.format(0, true)}`,
                                data: `${e.Admin} Um administrador removeu ${value} Safiras`
                            }],
                            $position: 0
                        }
                    }
                },
                response: `removeu **${value} ${moeda}** de ${targetUser} \`${targetUser.id}\``
            },
            reconfig: {
                mongoose: {
                    $set: {
                        Balance: value
                    },
                    $push: {
                        Transactions: {
                            $each: [{
                                time: `${Date.format(0, true)}`,
                                data: `${e.Admin} Um administrador redefiniu o saldo para ${value} Safiras`
                            }],
                            $position: 0
                        }
                    }
                },
                response: `redefiniu o saldo de ${targetUser} \`${targetUser.id}\``
            }
        }[method]

        if (!dataMethod)
            return await interaction.reply({
                content: `${e.Deny} | Método não reconhecido`,
                ephemeral: true
            })

        const newData = await this.Database.User.findOneAndUpdate(
            { id: userId },
            dataMethod.mongoose,
            { upsert: true, new: true }
        )
            .then(doc => {
                this.Database.saveUserCache(doc?.id, doc)
                return doc
            })

        return await interaction.reply({
            content: `${e.Check} | Você ${dataMethod.response}.\n${e.Info} | Novo valor: **${newData.Balance.currency()} ${moeda}**`
        })

    }

    editProfile = async ({ interaction, fields, user }) => {

        let data = await this.Database.getUser(user.id)
        let title = fields.getTextInputValue('profileTitle') || ''
        let job = fields.getTextInputValue('profileJob') || ''
        let status = fields.getTextInputValue('profileStatus') || ''
        let birth = fields.getTextInputValue('profileBirth') || ''
        let msg = 'ℹ | Alteração concluída.'
        const saveData = {}
        const response = []

        if (title !== data?.Perfil?.Titulo) {
            response.push('✅ | Título')
            saveData['Perfil.Titulo'] = title
        }

        if (job && job !== data?.Perfil?.Trabalho) {
            response.push('✅ | Trabalho')
            saveData['Perfil.Trabalho'] = job
        }

        if (birth && birth !== data?.Perfil?.Aniversario) {

            const date = moment(birth, "DDMMYYYY")
            const formatedData = date.locale('BR').format('L')

            if (!date.isValid() || date.isBefore(Date.eightyYears()) || date.isAfter(Date.thirteen()))
                response.push('❌ | Aniversário contém uma data inválida')
            else {
                response.push('✅ | Aniversário')
                saveData['Perfil.Aniversario'] = formatedData
            }

        }

        if (status && status !== data?.Perfil?.Status) {
            response.push('✅ | Status')
            saveData['Perfil.Status'] = status
        }

        if (!response.length)
            return await interaction.reply({
                content: `${e.Deny} | Nada foi alterado.`,
                ephemeral: true
            })

        return Database.User.findOneAndUpdate(
            { id: user.id },
            { $set: saveData },
            { upsert: true, new: true }
        )
            .then(doc => {
                Database.saveUserCache(doc?.id, doc)
                return interaction.reply({
                    content: msg + '\n' + response.join('\n'),
                    ephemeral: true
                })
            })
            .catch(async () => await interaction.reply({
                content: `${e.Deny} | Não foi possível concluir a alteração do seu perfil.`,
                ephemeral: true
            }))
    }

    botSugest = async ({ interaction, fields, user, client, guild } = this) => {

        const text = fields.getTextInputValue('text')
        const guildChannel = client.channels.cache.get(config.BugsChannelId)

        if (!guildChannel)
            return await interaction.reply({
                content: `${e.Info} | O canal de envio de sugestões no servidor central não foi encontrado.`,
                ephemeral: true
            })

        const embed = {
            color: client.blue,
            title: `💭 ${user.tag} enviou uma ideia`,
            description: text,
            fields: [
                {
                    name: 'Extra Data',
                    value: `UserId: ${user.id}\nGuild: ${guild.name} - \`${guild.id}\``
                }
            ]
        }

        return guildChannel.send({ embeds: [embed] })
            .then(async () => {
                return await interaction.reply({
                    content: `${e.Check} | A sua ideia foi enviada com sucesso e se for válida, você receberá uma recompensa.`,
                    ephemeral: true
                })
            })
            .catch(async () => {
                return await interaction.reply({
                    content: `${e.Warn} | Houve um erro com o envio da sua ideia\n> \`${err}\``,
                    ephemeral: true
                })
            })

    }

    serverSugest = async ({ interaction, fields, user, client, guild } = this) => {

        const text = fields.getTextInputValue('text')
        // const guildData = await this.Database.Guild.findOne({ id: guild.id }, 'IdeiaChannel')
        const guildData = await this.Database.getGuild(guild.id)
        const channelId = guildData?.IdeiaChannel
        const channel = guild.channels.cache.get(channelId)

        if (!channel)
            return await interaction.reply({
                content: `${e.Info} | O canal de envio não foi encontrado.`,
                ephemeral: true
            })

        const embed = {
            color: client.blue,
            author: { name: `${user.tag} enviou uma sugestão`, iconURL: user.displayAvatarURL({ forceStatic: false, format: "png", size: 1024 }) },
            description: text,
            footer: { text: '/enviar' },
            timestamp: new Date()
        }

        return channel.send({ embeds: [embed] })
            .then(async msg => {

                for (let i of [e.Upvote, e.DownVote, e.QuestionMark]) msg.react(i).catch(() => { })

                return await interaction.reply({
                    content: `${e.Check} | A sua ideia foi enviada com sucesso e você pode vê-la no canal ${channel}.`,
                    ephemeral: true
                })
            })
            .catch(async err => {
                return await interaction.reply({
                    content: `${e.Warn} | Houve um erro com o envio da sua ideia\n> \`${err}\``,
                    ephemeral: true
                })
            })

    }

    serverReport = async ({ interaction, fields, user, client, guild } = this) => {

        const text = fields.getTextInputValue('text')
        // const guildData = await this.Database.Guild.findOne({ id: guild.id }, 'ReportChannel')
        const guildData = await this.Database.getGuild(guild.id)
        const channelId = guildData?.ReportChannel
        const channel = guild.channels.cache.get(channelId)

        if (!channel)
            return await interaction.reply({
                content: `${e.Info} | O canal de envio não foi encontrado.`,
                ephemeral: true
            })

        const embed = {
            color: client.red,
            title: `${e.Report} Novo Reporte Recebido`,
            thumbnail: { url: user.displayAvatarURL({ forceStatic: false, format: "png", size: 1024 }) || null },
            description: `**Conteúdo do Reporte:**\n${text}`,
            fields: [{
                name: '👤 Author do Reporte',
                value: `${user} | \`${user.id}\``
            }],
            timestamp: new Date()
        }

        return channel.send({ embeds: [embed] })
            .then(async msg => {

                return await interaction.reply({
                    content: `${e.Check} | O seu reporte foi enviado com sucesso ao canal designado.`,
                    ephemeral: true
                })
            })
            .catch(async err => {
                return await interaction.reply({
                    content: `${e.Warn} | Houve um erro com o envio do seu reporte.\n> \`${err}\``,
                    ephemeral: true
                })
            })

    }

    BugModalReport = async ({ interaction, client, fields, user, channel, guild } = this) => {

        const textExplain = fields.getTextInputValue('bugTextInfo')
        const commandWithError = fields.getTextInputValue('commandBuggued') || 'Nenhum'
        const ChannelInvite = await channel.createInvite({ maxAge: 0 }).catch(() => nulll)
        const guildName = ChannelInvite?.url ? `[${guild.name}](${ChannelInvite.url})` : guild.name

        const embed = {
            color: client.red,
            title: '📢 Report de Bug/Erro Recebido',
            url: ChannelInvite?.url || null,
            description: `> Reporte enviado de: ${guildName}\n> ${user.username} - \`${user.id}\`\n\`\`\`txt\n${textExplain || 'Nenhum dado coletado.'}\n\`\`\``,
            fields: [
                {
                    name: 'ℹ️ | Comando reportado',
                    value: `\`${commandWithError || 'Nenhum'}\``,
                }
            ],
            timestamp: new Date()
        }

        const guildChannel = await client.channels.fetch(config.BugsChannelId).catch(() => null)

        if (!guildChannel)
            return await interaction.reply({
                content: `❌ | Houve um erro ao encontrar o canal designado para recebimento de reports. Por favor, fale diretamente com meu criador: ${client.users.resolve(Config.ownerId)?.tag || 'Não encontrado'}`,
                embeds: [embed],
                ephemeral: true
            })

        return guildChannel.send({ embeds: [embed] })
            .then(async () => {
                return await interaction.reply({
                    content: `✅ | Reporte enviado com sucesso! Muito obrigada pelo seu apoio.`,
                    embeds: [embed],
                    ephemeral: true
                })
            })
            .catch(async err => {
                return await interaction.reply({
                    content: `❌ | Houve um erro ao enviar o reporte para o canal designado. Por favor, fale diretamente com meu criador: ${client.users.resolve(Config.OwnerId)?.tag || 'Não encontrado'}\n${err}`,
                    embeds: [embed],
                    ephemeral: true
                })
            })

    }

    transactionsModalReport = async () => {

        const problemText = this.fields.getTextInputValue('text')
        const channel = client.channels.cache.get(config.BugsChannelId)
        let messageResponse = '✅ | Reporte enviado com sucesso!'

        if (!channel)
            return await this.interaction.reply({
                content: `❌ | Erro ao contactar o canal de reportes.`,
                ephemeral: true
            })

        channel.send({
            embeds: [{
                color: client.red,
                title: '📢 Reporte de Bugs | TRANSACTIONS COMMAND',
                fields: [
                    {
                        name: '👤 Usuário',
                        value: `> ${this.user?.tag || 'NOT FOUND'} - \`${this.user?.id}\``
                    },
                    {
                        name: '📝 Conteúdo do Reporte',
                        value: `\`\`\`txt\n${problemText}\n\`\`\``
                    }
                ]
            }]
        }).catch(() => {
            messageResponse = '❌ | Erro ao enviar o reporte ao canal principal.'
        })

        return await this.interaction.reply({ content: messageResponse, ephemeral: true })

    }

}