import {
    Base,
    SaphireClient as client,
    Database
} from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'
import { Config as config } from '../../util/Constants.js'
import moment from 'moment'
import { CodeGenerator } from '../../functions/plugins/plugins.js'
import { ButtonStyle, ChannelType, PermissionFlagsBits } from 'discord.js'
import axios from 'axios'
import cantadasModal from './modals/cantadas/cantadas.modal.js'

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
        if (/\d{18,}/.test(this.customId)) return import('./modals/wordleGame/wordleGame.modal.js').then(data => data.default(this))

        const ModalInteractionFunctions = {
            BugModalReport: [this.BugModalReport, this],
            editProfile: [this.editProfile, this],
            logomarcaReporter: [this.logomarcaReporter, this],
            newLetter: [this.newLetter, this],
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
            cantada: [cantadasModal, this]
        }[this.customId]

        if (ModalInteractionFunctions)
            return ModalInteractionFunctions[0](ModalInteractionFunctions[1])

        return await this.interaction.reply({
            content: `${e.Info} | Este modal n??o possui uma fun????o correspondente a ele.`,
            ephemeral: true
        })
    }

    async announce({ interaction, user, guild, member, fields }) {

        const guildData = await Database.Guild.findOne({ id: guild.id }, "announce")
        const channel = await guild.channels.fetch(guildData?.announce?.channel || "undefined").catch(() => null)
        const notificationRole = await guild.roles.fetch(guildData?.announce?.notificationRole || "undefined").catch(() => null)
        const allowedRole = await guild.roles.fetch(guildData?.announce?.allowedRole || "undefined").catch(() => null)

        if (!channel || !notificationRole || !allowedRole)
            return await interaction.reply({
                content: `${e.Deny} | A configura????o deste comando n??o est?? completa ou desatualizada. Por favor, reconfigure usando o mesmo comando ou pedindo a um administrador.`,
                ephemeral: true
            })

        if (!member.roles.cache.has(allowedRole.id) && !member.permissions.has(PermissionFlagsBits.Administrator))
            return await interaction.reply({
                content: `${e.Deny} | Voc?? n??o tem o cargo necess??rio para publicar not??cias. (${notificationRole})`,
                ephemeral: true
            })

        const title = fields.getTextInputValue('title') || null
        const description = fields.getTextInputValue('notice') || null
        const font = fields.getTextInputValue('font') || null
        const thumbnail = fields.getTextInputValue('thumbnail') || null
        const image = fields.getTextInputValue('image') || null

        if (!title || !description || !font)
            return await interaction.reply({
                content: `${e.Deny} | As informa????es n??o foram passadas corretamentes.`,
                ephemeral: true
            })

        if (!font.isURL())
            return await interaction.reply({
                content: `${e.Deny} | O campo de "Fonte" repassado n??o ?? um link v??lido.`,
                ephemeral: true
            })

        if (thumbnail && !thumbnail?.isURL())
            return await interaction.reply({
                content: `${e.Deny} | O campo de "Thumbnail" repassado n??o ?? um link v??lido.`,
                ephemeral: true
            })

        if (image && !image?.isURL())
            return await interaction.reply({
                content: `${e.Deny} | O campo de "Imagem" repassado n??o ?? um link v??lido.`,
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
                    name: '???? Autor(a)',
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
                    emoji: '????',
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
                content: `${e.Check} | A sua not??cia foi publicada com sucesso.`,
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: 'Ver Not??cia',
                                emoji: '????',
                                style: ButtonStyle.Link,
                                url: message.url
                            }
                        ]
                    }
                ],
                ephemeral: true
            }))
            .catch(async err => await interaction.reply({
                content: `${e.Deny} | N??o foi poss??vel publicar a not??cia.\n${e.Bug} | \`${err}\``,
                ephemeral: true
            }))
    }

    async addFanart({ interaction, fields }) {

        const imageUrl = fields.getTextInputValue('imageURL')
        const imageName = fields.getTextInputValue('imageName')
        const userId = JSON.parse(this.customId)?.src
        const user = await this.client.users.fetch(userId).catch(() => null)

        if (!user)
            return await interaction.reply({
                content: `${e.Deny} | Usu??rio n??o encontrado.`,
                ephemeral: true
            })

        const fanarts = await this.Database.Fanart.find({}) || []
        const allIds = fanarts?.map(fan => fan?.id) || []

        if (fanarts.find(fan => fan?.url === imageUrl))
            return await interaction.reply({
                content: `${e.Deny} | Essa fanart j?? existe no banco de dados.`,
                ephemeral: true
            })

        if (fanarts.find(fan => fan?.name === imageName))
            return await interaction.reply({
                content: `${e.Deny} | Uma fanart com esse nome j?? existe no banco de dados.`,
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
            url: imageUrl,
            userId: user.id
        })
            .then(async () => await interaction.reply({
                content: `${e.Check} | Fanart salva com sucesso.`,
                ephemeral: true
            }))
            .catch(async error => await interaction.reply({
                content: `${e.Deny} | N??o foi poss??vel salvar essa Fanart.\n${e.Warn} | \`${error}\``,
                ephemeral: true
            }))

    }

    async reportBalance({ interaction, fields, user }) {

        const report = fields.getTextInputValue('report')

        const embed = {
            color: client.blue,
            title: `???? Balance Report`,
            description: report,
            fields: [
                {
                    name: '???? Usu??rio',
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
                content: `${e.Check} | O seu report foi enviado com sucesso.\n${e.Info} | Caso queira acompanhar ou se comunicar com a staff, por favor, entre no meu servidor clicando no bot??o abaixo.`,
                components: [linkButton],
                ephemeral: true
            }))
            .catch(() => notSend())

        async function notSend() {
            return await interaction.reply({
                content: `${e.Deny} | N??o foi poss??vel obter o canal de envio. Por favor, contacte algum membro da minha staff.`,
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
                content: `${e.Deny} | N??o foi poss??vel localizar o ID do canal para editar o t??pico.`,
                ephemeral: true
            })

        const channel = guild.channels.cache.get(channelId)

        if (!channel)
            return await interaction.reply({
                content: `${e.Deny} | Eu n??o encontrei o canal selecionado.`,
                ephemeral: true
            })

        const fail = await channel.edit({
            topic: newTopic,
            reason: `${user.tag} editou o t??pico deste canal.`
        })
            .catch(err => err.code)

        if (fail.constructor === Number) {

            const content = {
                10003: `${e.Deny} | Este canal ?? desconhecido. Por favor, tente em outro canal.`,
                50024: `${e.Deny} | Essa a????o n??o pode ser executada nesse tipo de canal.`
            }[fail] || `${e.Deny} | N??o foi poss??vel editar o t??pico do canal ${channel}.`

            return await interaction.reply({ content: content, ephemeral: true })
        }

        return await interaction.reply({
            content: `${e.Check} | O t??pico do canal ${channel} foi editado com sucesso.`,
            ephemeral: true
        })
    }

    async channelClone({ interaction, fields, user, customId, guild }) {

        const newName = fields.getTextInputValue('channelName')
        const channelIdData = JSON.parse(customId)
        const channelId = channelIdData?.id

        if (!channelId)
            return await interaction.reply({
                content: `${e.Deny} | N??o foi poss??vel localizar o ID do canal para efetuar a clonagem.`,
                ephemeral: true
            })

        const channel = guild.channels.cache.get(channelId)

        if (!channel)
            return await interaction.reply({
                content: `${e.Deny} | Eu n??o encontrei o canal selecionado.`,
                ephemeral: true
            })

        const fail = await channel.clone({
            name: newName,
            reason: `${user.tag} clonou este canal.`
        })
            .catch(err => err.code)

        if (fail.constructor === Number) {

            const content = {
                10003: `${e.Deny} | Este canal ?? desconhecido. Por favor, tente em outro canal.`,
                50024: `${e.Deny} | Essa a????o n??o pode ser executada nesse tipo de canal.`
            }[fail] || `${e.Deny} | N??o foi poss??vel clonar o canal ${channel}.`

            return await interaction.reply({ content: content, ephemeral: true })
        }

        return await interaction.reply({
            content: `${e.Check} | O canal ${channel} foi clonado com sucesso. Aqui est?? ele: ${fail}`,
            ephemeral: true
        })
    }

    async editChannelName({ interaction, fields, user, customId, guild }) {

        const newName = fields.getTextInputValue('channelName')
        const channelIdData = JSON.parse(customId)
        const channelId = channelIdData?.id

        if (!channelId)
            return await interaction.reply({
                content: `${e.Deny} | N??o foi poss??vel localizar o ID do canal para a edi????o do nome.`,
                ephemeral: true
            })

        const channel = guild.channels.cache.get(channelId)

        if (!channel)
            return await interaction.reply({
                content: `${e.Deny} | Eu n??o encontrei o canal selecionado.`,
                ephemeral: true
            })

        const fail = await channel.setName(newName, `${user.tag} editou o nome deste canal`)
            .catch(err => err.code)

        if (fail.constructor === Number) {

            const content = {
                10003: `${e.Deny} | Este canal ?? desconhecido. Por favor, tente em outro canal.`,
                50024: `${e.Deny} | Essa a????o n??o pode ser executada nesse tipo de canal.`
            }[fail] || `${e.Deny} | N??o foi poss??vel editar o nome do canal ${channel}.`

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
                content: `${e.Deny} | Est?? logomarca j?? existe no banco de dados.`,
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
                content: `${e.Deny} | Eu n??o achei o canal de envio`,
                ephemeral: true
            })

        return channel.send({
            embeds: [{
                color: client.blue,
                title: '???? Nova Indica????o de Logomarca',
                fields: [
                    {
                        name: '???? Usu??rio',
                        value: `${user.tag} - \`${user.id}\``
                    },
                    {
                        name: '??? Indica????o ou Indica????es',
                        value: `\`${marca}\``
                    }
                ]
            }]
        })
            .then(async () => {
                return await interaction.reply({
                    content: `${e.Check} | Sua indica????o de logomarca foi enviada com sucesso para a minha equipe de designers.`,
                    ephemeral: true
                })
            })
            .catch(async () => {
                return await interaction.reply({
                    content: `${e.Deny} | Ocorreu um erro ao enviar sua indica????o de logomarca.`,
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
                    title: '???? Error Reporter | Logomarca',
                    description: description,
                    fields: [
                        {
                            name: '??? Erro reportado',
                            value: bug
                        },
                        {
                            name: '???? Usu??rio',
                            value: `${user.tag} - \`${user.id}\``
                        }
                    ]
                }],
                fetchReply: true
            }
        ).catch(() => null)

        if (!sended)
            return await interaction.reply({
                content: `${e.Deny} | N??o foi poss??vel concluir o envio do seu report.`,
                ephemeral: true
            })

        return await interaction.reply({
            content: `${e.Check} | O seu report foi enviado com sucesso. Muito obrigado por me ajudar ???`,
            ephemeral: true
        })

    }

    async animeIndications({ interaction, fields, user, Database }) {

        const animeName = fields.getTextInputValue('name')
        const allAnimes = await Database.animeIndications() || []
        const alreadyExist = allAnimes.find(anime => anime?.name?.toLowerCase() === animeName?.toLowerCase())

        if (alreadyExist)
            return await interaction.reply({
                content: `${e.Deny} | O anime \`${animeName}\` j?? existe no banco de dados.`,
                ephemeral: true
            })

        return await axios({
            method: "GET",
            baseURL: `https://kitsu.io/api/edge/anime?filter[text]=${animeName
                .toLowerCase()
                .replace(/[??????????]/gi, 'a')
                .replace(/[????????]/gi, 'e')
                .replace(/[????????]/gi, 'i')
                .replace(/[??????????]/gi, 'o')
                .replace(/[????????]/gi, 'u')
                .replace(/[??]/gi, 'c')
                }`,
            headers: {
                Accept: 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json'
            }
        })
            .then(async result => {
                if (!result || !result?.data?.data || !result?.data?.data?.length)
                    return await interaction.reply({
                        content: `${e.Deny} | Eu n??o achei nenhum anime com a sua indica????o.`,
                        ephemeral: true
                    }).catch(() => { })

                return await sendIndication()
            })
            .catch(async () => {
                return await interaction.reply({
                    content: `${e.Deny} | O anime indicado n??o existe ou eu n??o achei ele na lista de animes da Kitsu.`,
                    ephemeral: true
                })
            })

        async function sendIndication() {

            const embed = {
                color: client.blue,
                title: '???? Nova Indica????o',
                description: 'Preencha os campos com todas as TAG\'s que se encaixam ao anime indicado.',
                fields: [
                    {
                        name: '???? Anime',
                        value: animeName
                    },
                    {
                        name: '???? G??neros',
                        value: `${e.Loading} Esperando sele????o de g??neros...`
                    },
                    {
                        name: '??????? Tags (1)',
                        value: `${e.Loading} Esperando sele????o de tags...`
                    },
                    {
                        name: '??????? Tags (2)',
                        value: `${e.Loading} Esperando sele????o de tags...`
                    },
                    {
                        name: '???? P??blico Alvo',
                        value: `${e.Loading} Esperando sele????o de p??blico alvo...`

                    }
                ],
                footer: { text: user.id }
            }

            const optionsGender = [
                {
                    label: 'A????o',
                    description: 'Adrenalina, cenas de gelar o cora????o',
                    emoji: '?????????????',
                    value: 'A????o'
                },
                {
                    label: 'Aventura',
                    description: 'Viagens, conhecimento e coisas novas',
                    emoji: '????',
                    value: 'Aventura'
                },
                {
                    label: 'Com??dia',
                    description: 'Risadas, coisas engra??adas e divertidas',
                    emoji: '????',
                    value: 'Com??dia'
                },
                {
                    label: 'Drama',
                    description: 'Hist??ria ou cenas que mexe com o emocional',
                    emoji: '????',
                    value: 'Drama'
                },
                {
                    label: 'Ecchi/Hentai',
                    description: 'Conte??do n??o recomendado para menores de 18 anos',
                    emoji: '????',
                    value: 'Ecchi/Hentai'
                },
                {
                    label: 'Fantasia',
                    description: 'Magia, poderes, coisas n??o reais',
                    emoji: '?????????????',
                    value: 'Fantasia'
                },
                {
                    label: 'Terror',
                    description: 'Medo, susto, fantasmas, coisas horriveis',
                    emoji: '????',
                    value: 'Terror'
                },
                {
                    label: 'Rob??s',
                    description: 'Algo bem pro futuro, robos e tecnologia',
                    emoji: '????',
                    value: 'Rob??s'
                },
                {
                    label: 'Musical',
                    description: 'Canto, melodia e m??sica',
                    emoji: '????',
                    value: 'Musical'
                },
                {
                    label: 'Psicol??gico',
                    description: 'Conte??do refente ao psicol??gico humano',
                    emoji: '????',
                    value: 'Psicol??gico'
                },
                {
                    label: 'Romance',
                    description: 'Amor, timidez e borboletas no estomago',
                    emoji: '????',
                    value: 'Romance'
                },
                {
                    label: 'Sci-Fi / Fic????o Cient??fica',
                    description: 'Nada aqui ?? real, ?? tudo uma fic????o',
                    emoji: '????',
                    value: 'Sci-Fi'
                },
                {
                    label: 'Vida Cotidiana',
                    description: 'Um anime que qualquer um poderia viver',
                    emoji: '???????????',
                    value: 'Vida Cotidiana'
                },
                {
                    label: 'Esportes',
                    description: 'Desde futebol, at?? ping-pong',
                    emoji: '???',
                    value: 'Esportes'
                },
                {
                    label: 'Supernatural',
                    description: 'N??o ?? a s??rie, ?? conte??do supernatural',
                    emoji: '????',
                    value: 'Supernatural'
                },
                {
                    label: 'Suspense',
                    description: 'Animes onde o suspense ataca a ansiedade',
                    emoji: '????????????????',
                    value: 'Suspense'
                },
                {
                    label: 'Mist??rio',
                    description: 'Animes onde tudo ?? um mist??rio',
                    emoji: '????',
                    value: 'Mist??rio'
                },
                {
                    label: 'Luta',
                    description: 'Lutas e brigas faz parte da hist??ria',
                    emoji: '????',
                    value: 'Luta'
                }
            ]

            const optionsTags = [
                {
                    label: 'Artes Marciais',
                    description: 'Envolve personagens que utilizam t??cnicas de artes marciais',
                    value: 'Artes Marciais'
                },
                {
                    label: 'Avant-Garde',
                    description: 'Apresentam temas experimentais, inovadores e filos??ficos',
                    value: 'Avant-Garde'
                },
                {
                    label: 'Boys Love (BL)',
                    description: 'A hist??ria gira em torno de um romance homoafetivo entre garotos.',
                    value: 'Boys Love (BL)'
                },
                {
                    label: 'Girls Love (GL)',
                    description: 'A hist??ria gira em torno de um romance homoafetivo entre garotas.',
                    value: 'Girls Love (GL)'
                },
                {
                    label: 'Cyberpunk',
                    description: 'Apresenta um mundo em que a sociedade est?? mais arraigada ?? tecnologia.',
                    value: 'Cyberpunk'
                },
                {
                    label: 'Faroeste',
                    description: 'Acontece em um lugar semelhante ao Velho-Oeste americano.',
                    value: 'Faroeste'
                },
                {
                    label: 'Isekai',
                    description: 'Animes onde a hist??ria ocorre em outro mundo',
                    value: 'Isekai'
                },
                {
                    label: 'Jogos',
                    description: 'S??o focados em jogos eletr??nicos, RPG, etc.',
                    value: 'Jogos'
                },
                {
                    label: 'Hist??rico',
                    description: 'Em sua maioria contam a hist??ria de um Jap??o da ??poca feudal.',
                    value: 'Hist??rico'
                },
                {
                    label: 'Policial/Investiga????o',
                    description: 'Focado em a????es policiais/investigativas.',
                    value: 'Policial/Investiga????o'
                },
                {
                    label: 'P??s-Apocal??ptico',
                    description: 'Focado em um mundo depois de um apocal??pse',
                    value: 'P??s-Apocal??ptico'
                },
                {
                    label: 'Slice-of-life',
                    description: '?? centrado no dia a dia de pessoas comuns.',
                    value: 'Slice-of-life'
                },
                {
                    label: 'Sobrenatural',
                    description: 'Animes onde o sobrenatural ?? presente',
                    value: 'Sobrenatural'
                },
                {
                    label: 'Superpoderes',
                    description: 'Animes onde os personagens possuem superpoderes',
                    value: 'Superpoderes'
                },
                {
                    label: 'Vida escolar',
                    description: 'Geralmente os personagens v??o a escola.',
                    value: 'Vida escolar'
                },
                {
                    label: 'Ecchi/Hentai',
                    description: 'O foco s??o cenas sexualmente provocativas.',
                    value: 'Ecchi'
                },
                {
                    label: 'Har??m',
                    description: 'O personagem principal possui um har??m.',
                    value: 'Har??m'
                },
                {
                    label: 'Crian??as',
                    description: 'Cont??m crian??as neste anime',
                    value: 'Crian??as'
                },
                {
                    label: 'Viagem',
                    description: 'Ocorrem viagens ao desenrolar da hist??ria',
                    value: 'Viagem'
                },
                {
                    label: 'Flash Black',
                    description: 'Ocorre muito flash black ao decorrer do anime',
                    value: 'Flash Black'
                },
                {
                    label: 'Fuga/Persegui????o',
                    description: 'O/A protagonista ?? algu??m que est?? sob constante fuga/persegui????o',
                    value: 'Fuga/Persegui????o'
                },
                {
                    label: 'Battle Royale',
                    description: 'Luta em uma arena ou algo parecido ?? presente nesta hist??ria',
                    value: 'Battle Royale'
                },
                {
                    label: 'Bullying',
                    description: 'O anime fala/trata sobre bullying',
                    value: 'Bullying'
                },
                {
                    label: 'Parkour',
                    description: 'O esporte parkour ?? praticado por aqui',
                    value: 'Parkour'
                },
                {
                    label: 'Tortura',
                    description: 'Esse anime cont??m cenas de tortura',
                    value: 'Tortura'
                }
            ]

            const optionsTags2 = [
                {
                    label: 'Agricultura/Natureza',
                    description: 'O cuidado com a natureza ?? um abordado',
                    value: 'Agricultura/Natureza'
                },
                {
                    label: 'Vida Familiar',
                    description: 'Temas como familia ?? presente na hist??ria',
                    value: 'Vida Familiar'
                },
                {
                    label: 'Depress??o/Ansiedade',
                    description: 'Personagens sofre destes problemas',
                    value: 'Depress??o/Ansiedade'
                },
                {
                    label: 'Carros/Motos/Avi??es',
                    description: 'Os personagens se envolvem no ramo automobil??stico',
                    value: 'Carros/Motos/Avi??es'
                },
                {
                    label: 'Guerra',
                    description: 'O anime acontece no contexto de uma guerra',
                    value: 'Guerra'
                },
                {
                    label: 'Religi??o',
                    description: 'A religi??o ?? abordada durante a hist??ria',
                    value: 'Religi??o'
                },
                {
                    label: 'Pol??tica',
                    description: 'O governo ou membros dele tem um peda??o da hist??ria',
                    value: 'Pol??tica'
                },
                {
                    label: 'M??dico/Medicina',
                    description: 'O ramo hospitalar ?? bem com??m aqui',
                    value: 'M??dico/Medicina'
                }
            ]

            for (let cat of [...optionsTags, ...optionsTags2])
                cat.emoji = '???????'

            const selectMenuGender = {
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'animeSuggestionsGender',
                    placeholder: 'Selecionar G??neros',
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
                    placeholder: 'Selecionar P??blico Alvo',
                    min_values: 0,
                    max_values: 5,
                    options: [
                        {
                            label: 'Sh??jo',
                            description: 'Animes focado ao p??blico feminino jovem.',
                            emoji: '????',
                            value: 'Sh??jo'
                        },
                        {
                            label: 'Josei',
                            description: 'Foca-se em hist??rias e experi??ncias de mulheres japonesas.',
                            emoji: '????',
                            value: 'Josei'
                        },
                        {
                            label: 'Shounen',
                            description: 'Animes direcionados ao p??blico masculino jovem.',
                            emoji: '?????????????',
                            value: 'Shounen'
                        },
                        {
                            label: 'Seinen',
                            description: 'Animes com assuntos mais s??rios e pesados.',
                            emoji: '????',
                            value: 'Seinen'
                        },
                        {
                            label: 'Kodomo',
                            description: 'Animes com assuntos infantis',
                            emoji: '????',
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
                        emoji: '????',
                        custom_id: JSON.stringify({ c: 'anime', src: 'send' }),
                        style: ButtonStyle.Success,
                        disabled: true,
                    },
                    {
                        type: 2,
                        label: 'Cancelar',
                        emoji: '???',
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
                content: `${e.Deny} | Canal de sugest??es do jogo n??o encontrado.`,
                ephemeral: true
            })

        const questionOne = fields.getTextInputValue('questionOne')
        const questionTwo = fields.getTextInputValue('questionTwo')

        const embed = {
            color: client.blue,
            title: `${e.QuestionMark} Sugest??o de Pergunta`,
            fields: [
                {
                    name: '???? Usu??rio',
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
                        label: 'Aceitar sugest??o',
                        emoji: e.Check,
                        description: 'Salvar esta sugest??o no banco de dados do jogo',
                        value: 'accept',
                    },
                    {
                        label: 'Recusar sugest??o',
                        emoji: e.Deny,
                        description: 'Recusar e deletar esta sugest??o',
                        value: 'deny'
                    },
                    {
                        label: 'Editar sugest??o',
                        emoji: '???',
                        description: 'Editar o conte??do da pergunta',
                        value: 'edit'
                    }
                ]
            }]
        }

        const sended = await channel.send({ embeds: [embed], components: [selectMenuObject] }).catch(() => null)

        return sended
            ? await interaction.reply({
                content: `${e.Check} | Sua sugest??o foi enviada com sucesso!`,
                embeds: [embed],
                ephemeral: true
            })
            : await interaction.reply({
                content: `${e.Deny} | N??o foi poss??vel completar o envio. ~Motivo: Desconhecido`,
                ephemeral: true
            })
    }

    animeIndicationsEdit = async ({ interaction, fields, user, message }) => {

        if (!message || !message?.embeds) return

        const { embeds } = message
        const embed = embeds[0]?.data

        if (!embed)
            return await interaction.update({
                content: `${e.Deny} | Embed n??o encontrada`,
                components: []
            })

        const name = fields.getTextInputValue('name')

        embed.fields[0] = {
            name: '???? Anime - (Editado)',
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
                content: `${e.Deny} | Embed n??o encontrada`,
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
                content: `${e.Deny} | Embed n??o encontrada`,
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
                label: 'Solicitar altera????o',
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
                content: `${e.Deny} | Voc?? n??o faz parte da equipe administrativa.`,
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
                content: `${e.Deny} | Usu??rio n??o encontrado.`,
                ephemeral: true
            })

        if (isNaN(value))
            return await interaction.reply({
                content: `${e.Deny} | O valor inserido n??o ?? um n??mero.`,
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
                content: `${e.Deny} | M??todo n??o reconhecido`,
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
            content: `${e.Check} | Voc?? ${dataMethod.response}.\n${e.Info} | Novo valor: **${newData.Balance.currency()} ${moeda}**`
        })

    }

    editProfile = async ({ interaction, fields, user }) => {

        let data = await this.Database.User.findOne({ id: user.id }, 'Perfil')
        let title = fields.getTextInputValue('profileTitle') || ''
        let job = fields.getTextInputValue('profileJob') || ''
        let status = fields.getTextInputValue('profileStatus') || ''
        let birth = fields.getTextInputValue('profileBirth') || ''
        let msg = '??? | Altera????o conclu??da.'
        const saveData = {}
        const response = []

        if (title !== data?.Perfil?.Titulo) {
            response.push('??? | T??tulo')
            saveData['Perfil.Titulo'] = title
        }

        if (job && job !== data?.Perfil?.Trabalho) {
            response.push('??? | Trabalho')
            saveData['Perfil.Trabalho'] = job
        }

        if (birth && birth !== data?.Perfil?.Aniversario) {

            const date = moment(birth, "DDMMYYYY")
            const formatedData = date.locale('BR').format('L')

            if (!date.isValid() || date.isBefore(Date.eightyYears()) || date.isAfter(Date.thirteen()))
                response.push('??? | Anivers??rio cont??m uma data inv??lida')
            else {
                response.push('??? | Anivers??rio')
                saveData['Perfil.Aniversario'] = formatedData
            }

        }

        if (status && status !== data?.Perfil?.Status) {
            response.push('??? | Status')
            saveData['Perfil.Status'] = status
        }

        if (!response.length)
            return await interaction.reply({
                content: `${e.Deny} | Nada foi alterado.`,
                ephemeral: true
            })

        return Database.User.updateOne(
            { id: user.id },
            { $set: saveData },
            { upsert: true }
        )
            .then(async result => {

                if (result.modifiedCount === 0)
                    return await interaction.reply({
                        content: `${e.Deny} | A altera????o do seu perfil n??o foi efetuada com sucesso.`,
                        ephemeral: true
                    })

                return await interaction.reply({
                    content: msg + '\n' + response.join('\n'),
                    ephemeral: true
                })
            })
            .catch(async () => {
                return await interaction.reply({
                    content: `${e.Deny} | N??o foi poss??vel concluir a altera????o do seu perfil.`,
                    ephemeral: true
                })
            })
    }

    botSugest = async ({ interaction, fields, user, client, guild } = this) => {

        const text = fields.getTextInputValue('text')
        const guildChannel = client.channels.cache.get(config.BugsChannelId)

        if (!guildChannel)
            return await interaction.reply({
                content: `${e.Info} | O canal de envio de sugest??es no servidor central n??o foi encontrado.`,
                ephemeral: true
            })

        const embed = {
            color: client.blue,
            title: `???? ${user.tag} enviou uma ideia`,
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
                    content: `${e.Check} | A sua ideia foi enviada com sucesso e se for v??lida, voc?? receber?? uma recompensa.`,
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
                content: `${e.Info} | O canal de envio n??o foi encontrado.`,
                ephemeral: true
            })

        const embed = {
            color: client.blue,
            author: { name: `${user.tag} enviou uma sugest??o`, iconURL: user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }) },
            description: text,
            footer: { text: '/enviar' },
            timestamp: new Date()
        }

        return channel.send({ embeds: [embed] })
            .then(async msg => {

                for (let i of [e.Upvote, e.DownVote, e.QuestionMark]) msg.react(i).catch(() => { })

                return await interaction.reply({
                    content: `${e.Check} | A sua ideia foi enviada com sucesso e voc?? pode v??-la no canal ${channel}.`,
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
                content: `${e.Info} | O canal de envio n??o foi encontrado.`,
                ephemeral: true
            })

        const embed = {
            color: client.red,
            title: `${e.Report} Novo Reporte Recebido`,
            thumbnail: { url: user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }) || null },
            description: `**Conte??do do Reporte:**\n${text}`,
            fields: [{
                name: '???? Author do Reporte',
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
            title: '???? Report de Bug/Erro Recebido',
            url: ChannelInvite?.url || null,
            description: `> Reporte enviado de: ${guildName}\n> ${user.username} - \`${user.id}\`\n\`\`\`txt\n${textExplain || 'Nenhum dado coletado.'}\n\`\`\``,
            fields: [
                {
                    name: '?????? | Comando reportado',
                    value: `\`${commandWithError || 'Nenhum'}\``,
                }
            ],
            timestamp: new Date()
        }

        const guildChannel = await client.channels.fetch(config.BugsChannelId).catch(() => null)

        if (!guildChannel)
            return await interaction.reply({
                content: `??? | Houve um erro ao encontrar o canal designado para recebimento de reports. Por favor, fale diretamente com meu criador: ${client.users.resolve(Config.ownerId)?.tag || 'N??o encontrado'}`,
                embeds: [embed],
                ephemeral: true
            })

        return guildChannel.send({ embeds: [embed] })
            .then(async () => {
                return await interaction.reply({
                    content: `??? | Reporte enviado com sucesso! Muito obrigada pelo seu apoio.`,
                    embeds: [embed],
                    ephemeral: true
                })
            })
            .catch(async err => {
                return await interaction.reply({
                    content: `??? | Houve um erro ao enviar o reporte para o canal designado. Por favor, fale diretamente com meu criador: ${client.users.resolve(Config.OwnerId)?.tag || 'N??o encontrado'}\n${err}`,
                    embeds: [embed],
                    ephemeral: true
                })
            })

    }

    newLetter = async ({ interaction, client, fields, user, guild } = this) => {

        let usernameData = fields.getTextInputValue('username')
        let anonymous = fields.getTextInputValue('anonymous')
        let letterContent = fields.getTextInputValue('letterContent')
        let userLetted = await client.users.fetch(usernameData?.id)

        if (!userLetted)
            return await interaction.reply({
                content: `??? | N??o foi poss??vel achar ningu??m com o dado informado. \`${usernameData}\``,
                embeds: [{
                    color: client.blue,
                    title: '???? Letter\'s Content',
                    description: `\`\`\`txt\n${letterContent}\n\`\`\``
                }],
                ephemeral: true
            })

        if (userLetted.id === user.id)
            return await interaction.reply({
                content: '??? | Voc?? n??o pode enviar cartas para voc?? mesmo.',
                ephemeral: true
            })

        if (userLetted.id === client.user.id)
            return await interaction.reply({
                content: '??? | Eu agrade??o seu gesto por me enviar uma carta, mas assim... Eu sou um bot, sabe? Fico te devendo essa.',
                ephemeral: true
            })

        if (userLetted.bot)
            return await interaction.reply({
                content: '??? | Voc?? n??o pode enviar cartas para bots.',
                ephemeral: true
            })

        let userData = await this.Database.User.findOne({ id: userLetted.id }, 'Letters.Blocked'),
            isBlock = userData?.Letters?.Blocked

        if (isBlock)
            return await interaction.reply({
                content: `??? | Este usu??rio bloqueou o envio de cartas. Voc?? vai precisar pedir para que ${userLetted.tag} libere o envio usando o comando '/carta block'`,
                ephemeral: true
            })

        const isAnonymous = ['sim', 'yes'].includes(anonymous?.toLowerCase()) ? true : false
        const ID = CodeGenerator(7).toLocaleUpperCase()

        await userLetted.send({
            content: `??? | Algum problema com a carta? Contacte um administrador usando o comando \`/carta report\``,
            embeds: [{
                color: client.blue,
                title: `???? ${client.user.username}'s Letters System`,
                description: `??? Esta carta foi enviada por: ${isAnonymous ? '\`Usu??rio an??nimo\`' : `${user.tag} - ${user.id}`}`,
                fields: [{
                    name: `???? Conte??do da carta`,
                    value: `\`\`\`txt\n${letterContent}\n\`\`\``
                }],
                footer: { text: `A ${client.user.username} n??o se responsabiliza pelo conte??do presente nesta carta.` }
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
                content: `??? | A carta foi enviada para ${userLetted.tag} com sucesso! (-1 carta)\n??????? | An??nimo: ${isAnonymous ? 'Sim' : 'N??o'}`,
                ephemeral: true
            })
        }

        async function error() {
            return await interaction.reply({
                content: `??? | Aparentemente a DM de ${userLetted.tag} est?? fechada e n??o posso efetuar o envio da carta.`,
                embeds: [{
                    color: client.blue,
                    title: '???? Lette\'s Content',
                    description: `\`\`\`txt\n${letterContent}\n\`\`\``
                }],
                ephemeral: true
            })
        }

    }

    transactionsModalReport = async () => {

        const problemText = this.fields.getTextInputValue('text')
        const channel = client.channels.cache.get(config.BugsChannelId)
        let messageResponse = '??? | Reporte enviado com sucesso!'

        if (!channel)
            return await this.interaction.reply({
                content: `??? | Erro ao contactar o canal de reportes.`,
                ephemeral: true
            })

        channel.send({
            embeds: [{
                color: client.red,
                title: '???? Reporte de Bugs | TRANSACTIONS COMMAND',
                fields: [
                    {
                        name: '???? Usu??rio',
                        value: `> ${this.user?.tag || 'NOT FOUND'} - \`${this.user?.id}\``
                    },
                    {
                        name: '???? Conte??do do Reporte',
                        value: `\`\`\`txt\n${problemText}\n\`\`\``
                    }
                ]
            }]
        }).catch(() => {
            messageResponse = '??? | Erro ao enviar o reporte ao canal principal.'
        })

        return await this.interaction.reply({ content: messageResponse, ephemeral: true })

    }

}