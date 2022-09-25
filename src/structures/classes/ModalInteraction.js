import { Base, SaphireClient as client } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'
import { Config as config } from '../../util/Constants.js'
import * as moment from 'moment'
import { CodeGenerator } from '../../functions/plugins/plugins.js'
import { ButtonStyle } from 'discord.js'
import axios from 'axios'

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

        if (/\d{18,}/.test(this.customId)) return import('./modals/wordleGame/wordleGame.modal.js').then(data => data.default(this))

        if (this.customId.includes('rather_')) return this.adminEditRather(this)

        switch (this.customId) {
            case 'BugModalReport': this.BugModalReport(this); break;
            case 'editProfile': this.editProfile(this); break;
            case 'logomarcaReporter': this.logomarcaReporter(this); break;
            case 'newLetter': this.newLetter(this); break;
            case 'lettersReport': this.lettersReport(this); break;
            case 'balance': this.balanceOptions(this); break;
            case 'rather': this.vocePrefere(this); break;
            case 'ratherEdit': this.vocePrefereEdit(this); break;
            case 'animeIndicationsEdit': this.animeIndicationsEdit(this); break;
            case 'animeIndications': this.animeIndications(this); break;
            case 'transactionsModalReport': this.transactionsModalReport(); break;
            case 'botSugest': this.botSugest(); break;
            case 'serverSugest': this.serverSugest(); break;
            case 'serverReport': this.serverReport(); break;
            default:
                break;
        }
        return
    }

    async logomarcaReporter({ interaction, fields, user, client }) {

        const bug = fields.getTextInputValue('bug')
        const description = fields.getTextInputValue('description')
        const errorChannel = await client.channels.fetch(config.clientErrorChannelId).catch(() => null)

        if (!errorChannel)
            return await interaction.reply({
                content: `${e.Deny} | O canal de report não foi encontrado.`,
                ephemeral: true
            })

        const fetchWebhook = await errorChannel.fetchWebhooks().catch(() => [])
        const webhook = fetchWebhook.find(web => web.name === client.user.id)
            || await channelLogs.createWebhook({
                name: client.user.id,
                avatar: config.ErrorWebhookProfileIcon,
                reason: 'Nenhuma webhook encontrada'
            })
                .catch(() => null)

        if (!webhook)
            return await interaction.reply({
                content: `${e.Deny} | A webhook de envio não foi encontrada.`,
                ephemeral: true
            })

        const sended = await webhook.send({
            avatarURL: 'https://media.discordapp.net/attachments/893361065084198954/1017604411603820575/questao1.png?width=484&height=484',
            username: 'QUIZ | Logomarca Reporter',
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
        }).catch(() => null)

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

        return await axios({
            baseURL: `https://kitsu.io/api/edge/anime?filter[text]=${animeName
                .replace(/[ãâáàä]/gi, 'a')
                .replace(/[êéèë]/gi, 'e')
                .replace(/[îíìï]/gi, 'i')
                .replace(/[õôóòö]/gi, 'o')
                .replace(/[ûúùü]/gi, 'u')
                .replace(/[ç]/gi, 'c')
                }`,
            headers: {
                Accept: 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json'
            }
        })
            .then(async result => {

                if (!result || !result?.data?.data || !result?.data?.data?.length)
                    return await interaction.reply({
                        content: `${e.Deny} | Eu não achei nenhum anime com a sua indicação.`,
                        ephemeral: true
                    }).catch(() => { })

                return await sendIndication()
            })
            .catch(async () => {
                return await interaction.reply({
                    content: `${e.Deny} | O anime indicado não existe ou eu não achei ele na lista de animes da Kitsu.`,
                    ephemeral: true
                })
            })

        async function sendIndication() {

            const embed = {
                color: client.blue,
                title: '💭 Nova Indicação',
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
                        name: '🎞 Categorias',
                        value: `${e.Loading} Esperando seleção de categorias...`
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
                    value: 'Ação'
                },
                {
                    label: 'Aventura',
                    value: 'Aventura'
                },
                {
                    label: 'Comédia',
                    value: 'Comédia'
                },
                {
                    label: 'Drama',
                    value: 'Drama'
                },
                {
                    label: 'Mistério',
                    value: 'Mistério'
                },
                {
                    label: 'Romance',
                    value: 'Romance'
                },
                {
                    label: 'Sci-Fi / Ficção Científica',
                    value: 'Sci-Fi'
                },
                {
                    label: 'Terror',
                    value: 'Terror'
                }
            ]

            const optionsCategory = [
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
                    label: 'Esporte',
                    description: 'Animes onde o assunto alvo é um ou mais esportes',
                    value: 'Esporte'
                },
                {
                    label: 'Faroeste',
                    description: 'Acontece em um lugar semelhante ao Velho-Oeste americano.',
                    value: 'Faroeste'
                },
                {
                    label: 'Fantasia',
                    description: 'Magia. Apresenta uma variedade de monstros e poderes mágicos.',
                    value: 'Fantasia'
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
                    label: 'Musical',
                    description: 'Focado na música, canto ou instrumento musicais.',
                    value: 'Musical'
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
                    label: 'Psicológico',
                    description: 'Abordagem em nível psicológico, jogos mentais.',
                    value: 'Psicológico'
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
                    label: 'Ecchi',
                    description: 'O foco são cenas sexualmente provocativas.',
                    value: 'Ecchi'
                },
                {
                    label: 'Hentai',
                    description: 'Animes onde possuem cenas de cunho adulto/nudez/sexo.',
                    value: 'Hentai'
                },
                {
                    label: 'Harém',
                    description: 'O personagem principal possui um harém.',
                    value: 'Harém'
                }
            ]

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

            const selectMenuCategory = {
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'animeSuggestionsCategory',
                    placeholder: 'Selecionar Categorias',
                    min_values: 0,
                    max_values: optionsCategory.length,
                    options: optionsCategory
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
                            value: 'Shōjo'
                        },
                        {
                            label: 'Josei',
                            description: 'Foca-se em histórias e experiências de mulheres japonesas.',
                            value: 'Josei'
                        },
                        {
                            label: 'Shounen',
                            description: 'Animes direcionados ao público masculino jovem.',
                            value: 'Shounen'
                        },
                        {
                            label: 'Seinen',
                            description: 'Animes com assuntos mais sérios e pesados.',
                            value: 'Seinen'
                        },
                        {
                            label: 'Kodomo',
                            description: 'Animes com assuntos infantis',
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
                components: [buttons, selectMenuGender, selectMenuCategory, selectMenuMatchPublic]
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
            {
                upsert: true,
                new: true,
                fields: 'Balance'
            }
        )

        return await interaction.reply({
            content: `${e.Check} | Você ${dataMethod.response}.\n${e.Info} | Novo valor: **${newData.Balance.currency()} ${moeda}**`
        })

    }

    editProfile = async ({ interaction, fields, user }) => {

        let data = await this.Database.User.findOne({ id: user.id }, 'Perfil')
        let title = undefined
        let job = fields.getTextInputValue('profileJob')
        let status = fields.getTextInputValue('profileStatus')
        let birth = fields.getTextInputValue('profileBirth')
        let msg = 'ℹ | Validação concluída. Resultado:'

        if (data?.Perfil?.TitlePerm)
            title = fields.getTextInputValue('profileTitle')

        if (title && title !== data?.Perfil?.Titulo) {
            msg += '\n✅ | Título'
            this.Database.updateUserData(user.id, 'Perfil.Titulo', title)
        } else msg += '\n❌ | Título'

        if (job && job !== data?.Perfil?.Trabalho) {
            msg += '\n✅ | Trabalho'
            this.Database.updateUserData(user.id, 'Perfil.Trabalho', job)
        } else msg += '\n❌ | Trabalho'

        if (birth && birth !== data?.Profile?.Aniversario) {

            const date = moment(birth, "DDMMYYYY")
            const formatedData = date.locale('BR').format('L')

            if (!date.isValid() || date.isBefore(Date.eightyYears()) || date.isAfter(Date.thirteen()))
                msg += '\n❌ | Aniversário'
            else {
                msg += '\n✅ | Aniversário'
                this.Database.updateUserData(user.id, 'Perfil.Aniversario', formatedData)
            }

        } else msg += '\n❌ | Aniversário'

        if (status && status !== data?.Perfil?.Status) {
            msg += '\n✅ | Status'
            this.Database.updateUserData(user.id, 'Perfil.Status', status)
        } else msg += '\n❌ | Status'


        return await interaction.reply({
            content: msg,
            ephemeral: true
        })

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
        const guildData = await this.Database.Guild.findOne({ id: guild.id }, 'IdeiaChannel')
        const channelId = guildData?.IdeiaChannel
        const channel = guild.channels.cache.get(channelId)

        if (!channel)
            return await interaction.reply({
                content: `${e.Info} | O canal de envio não foi encontrado.`,
                ephemeral: true
            })

        const embed = {
            color: client.blue,
            author: { name: `${user.tag} enviou uma sugestão`, iconURL: user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }) },
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
        const guildData = await this.Database.Guild.findOne({ id: guild.id }, 'ReportChannel')
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
            thumbnail: { url: user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }) || null },
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
        let ChannelInvite = await channel.createInvite({ maxAge: 0 }).catch(() => { }) || null
        let guildName = ChannelInvite?.url ? `[${guild.name}](${ChannelInvite.url})` : guild.name

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

        const guildChannel = client.channels.cache.get(config.BugsChannelId)

        if (!guildChannel)
            return await interaction.reply({
                content: `❌ | Houve um erro ao encontrar o canal designado para recebimento de reports. Por favor, fale diretamente com meu criador: ${client.users.resolve(Config.ownerId)?.tag || 'Não encontrado'}`,
                embeds: [embed],
                ephemeral: true
            })

        await guildChannel.send({ embeds: [embed] }).catch(async err => {
            return await interaction.reply({
                content: `❌ | Houve um erro ao enviar o reporte para o canal designado. Por favor, fale diretamente com meu criador: ${client.users.resolve(Config.OwnerId)?.tag || 'Não encontrado'}\n${err}`,
                embeds: [embed],
                ephemeral: true
            })
        })

        return await interaction.reply({
            content: `✅ | Reporte enviado com sucesso! Muito obrigada pelo seu apoio.`,
            embeds: [embed],
            ephemeral: true
        })

    }

    newLetter = async ({ interaction, client, fields, user, guild } = this) => {

        let usernameData = fields.getTextInputValue('username')
        let anonymous = fields.getTextInputValue('anonymous')
        let letterContent = fields.getTextInputValue('letterContent')
        let userLetted = await client.users.fetchUser(usernameData)

        if (!userLetted)
            return await interaction.reply({
                content: `❌ | Não foi possível achar ninguém com o dado informado. \`${usernameData}\``,
                embeds: [{
                    color: client.blue,
                    title: '📝 Letter\'s Content',
                    description: `\`\`\`txt\n${letterContent}\n\`\`\``
                }],
                ephemeral: true
            })

        if (userLetted.id === user.id)
            return await interaction.reply({
                content: '❌ | Você não pode enviar cartas para você mesmo.',
                ephemeral: true
            })

        if (userLetted.id === client.user.id)
            return await interaction.reply({
                content: '❌ | Eu agradeço seu gesto por me enviar uma carta, mas assim... Eu sou um bot, sabe? Fico te devendo essa.',
                ephemeral: true
            })

        if (userLetted.bot)
            return await interaction.reply({
                content: '❌ | Você não pode enviar cartas para bots.',
                ephemeral: true
            })

        let userData = await this.Database.User.findOne({ id: userLetted.id }, 'Letters.Blocked'),
            isBlock = userData?.Letters?.Blocked

        if (isBlock)
            return await interaction.reply({
                content: `❌ | Este usuário bloqueou o envio de cartas. Você vai precisar pedir para que ${userLetted.tag} libere o envio usando o comando '/carta block'`,
                ephemeral: true
            })

        const isAnonymous = ['sim', 'yes'].includes(anonymous?.toLowerCase()) ? true : false
        const ID = CodeGenerator(7).toLocaleUpperCase()

        await userLetted.send({
            content: `ℹ | Algum problema com a carta? Contacte um administrador usando o comando \`/carta report\``,
            embeds: [{
                color: client.blue,
                title: `📨 ${client.user.username}'s Letters System`,
                description: `ℹ Esta carta foi enviada por: ${isAnonymous ? '\`Usuário anônimo\`' : `${user.tag} - ${user.id}`}`,
                fields: [{
                    name: `📝 Conteúdo da carta`,
                    value: `\`\`\`txt\n${letterContent}\n\`\`\``
                }],
                footer: { text: `A ${client.user.username} não se responsabiliza pelo conteúdo presente nesta carta.` }
            }]
        })
            .then(() => sucess())
            .catch(() => error())

        async function sucess() {

            this.Database.subtractItem(user.id, 'Slot.Cartas', 1)
            this.Database.SetTimeout(user.id, 'Timeouts.Letter')

            this.Database.pushUserData(user.id, 'Letters.Sended', {
                letterId: ID,
                to: userLetted.id,
                guildId: guild.id,
                anonymous: isAnonymous,
                content: letterContent,
                date: Date.now()
            })

            this.Database.pushUserData(userLetted.id, 'Letters.Recieved', {
                letterId: ID,
                from: user.id,
                guildId: guild.id,
                anonymous: isAnonymous,
                content: letterContent,
                date: Date.now()
            })

            return await interaction.reply({
                content: `✅ | A carta foi enviada para ${userLetted.tag} com sucesso! (-1 carta)\n🕵️ | Anônimo: ${isAnonymous ? 'Sim' : 'Não'}`,
                ephemeral: true
            })
        }

        async function error() {
            return await interaction.reply({
                content: `❌ | Aparentemente a DM de ${userLetted.tag} está fechada e não posso efetuar o envio da carta.`,
                embeds: [{
                    color: client.blue,
                    title: '📝 Lette\'s Content',
                    description: `\`\`\`txt\n${letterContent}\n\`\`\``
                }],
                ephemeral: true
            })
        }

    }

    lettersReport = async ({ interaction, client, fields, user } = this) => {

        let letterId = fields.getTextInputValue('letterId'),
            reason = fields.getTextInputValue('reason')

        let Channel = client.channels.cache.get(config.letterChannelReport)

        if (!Channel)
            return await interaction.reply({
                content: '❌ | Não foi possível contactar o canal de reports no servidor principal.',
                ephemeral: true
            })

        Channel.send({
            embeds: [{
                color: client.red,
                title: `${e.Loud} Novo reporte de carta recebido`,
                fields: [
                    {
                        name: '🆔 ID da Carta/Usuário',
                        value: `\`${letterId}\``
                    },
                    {
                        name: `${e.Info} Motivo do reporte`,
                        value: `\`\`\`txt\n${reason}\`\`\``
                    }
                ],
                footer: { text: `ID do usuário: ${user.id}` }
            }]
        })

        return await interaction.reply({
            content: `✅ | Seu reporte foi enviado com sucesso! Caso você não queira receber mais cartas através da Saphire, use o comando \'/carta block\'. A Staff da ${client.user.username} analisará o ocorrido e punirá o responsável a altura.`,
            ephemeral: true
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