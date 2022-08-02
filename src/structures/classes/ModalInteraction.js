import { Base, SaphireClient as client } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'
import { Config as config } from '../../util/Constants.js'
import * as moment from 'moment'
import { CodeGenerator } from '../../functions/plugins/plugins.js'

export default class ModalInteraction extends Base {
    constructor(interaction) {
        super()
        this.interaction = interaction
        this.customId = interaction.customId
        this.fields = interaction.fields
        this.user = interaction.user
        this.guild = interaction.guild
        this.channel = interaction.channel
        this.data = {}
    }

    submitModalFunctions = async () => {

        if (/\d{18,}/.test(this.customId)) return this.wordleGame(this)

        this.member = this.guild.members.cache.get(this.user.id)

        const flags = this.Database.Flags.get('Flags') || []
        if (flags.find(data => data.country[0] === this.customId)) return this.editFlag(this)

        switch (this.customId) {
            case 'BugModalReport': this.BugModalReport(this); break;
            case 'editProfile': this.editProfile(this); break;
            case 'newLetter': this.newLetter(this); break;
            case 'lettersReport': this.lettersReport(this); break;
            case 'transactionsModalReport': this.transactionsModalReport(); break;
            case 'botSugest': this.botSugest(); break;
            case 'serverSugest': this.serverSugest(); break;
            case 'serverReport': this.serverReport(); break;
            default:
                break;
        }

        return
    }

    wordleGame = async ({ interaction, fields, user } = this) => {

        const { channel } = interaction

        const message = await channel.messages.fetch(this.customId)

        await interaction.reply({ content: 'ok' })
        // TODO: Continuar todo o resto aqui
        return console.log(message.embeds[0]?.data)
    }

    editProfile = async ({ interaction, fields, user } = this) => {

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
                content: `❌ | Houve um erro ao encontrar o canal designado para recebimento de reports. Por favor, fale diretamente com meu criador: ${client.users.cache.get(Config.ownerId)?.tag || 'Não encontrado'}`,
                embeds: [embed],
                ephemeral: true
            })

        await guildChannel.send({ embeds: [embed] }).catch(async err => {
            return await interaction.reply({
                content: `❌ | Houve um erro ao enviar o reporte para o canal designado. Por favor, fale diretamente com meu criador: ${client.users.cache.get(Config.OwnerId)?.tag || 'Não encontrado'}\n${err}`,
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
        let isError = false
        let userLetted = await client.getUser(usernameData)

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

        let isAnonymous = ['sim', 'yes'].includes(anonymous?.toLowerCase()) ? true : false,
            ID = CodeGenerator(7).toLocaleUpperCase()

        try {

            await userLetted.send({
                content: `ℹ | Algum problema com a carta? Contacte algúm administrador usando o comando \`-adm\``,
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
            }).catch(() => {
                isError = true
                return error()
            })

            if (isError) return
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

        } catch (err) {
            isError = true
            return error()
        }

        async function error() {
            isError = true
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

        let problemText = this.fields.getTextInputValue('text'),
            channel = client.channels.cache.get(config.BugsChannelId),
            messageResponde = `✅ | Reporte enviado com sucesso! Muito obrigado por reportar erros.`

        if (!channel) return await this.interaction.reply({
            content: `❌ | Erro ao contactar o canal de reportes.`,
            ephemeral: trueF
        })

        channel.send({
            embeds: [{
                color: client.red,
                title: '📢 Reporte de Bugs | TRANSACTIONS COMMAND',
                fields: [
                    {
                        name: '👤 Usuário',
                        value: `> ${this.user.tag || 'NOT FOUND'} - \`${this.user.id}\``
                    },
                    {
                        name: '📝 Conteúdo do Reporte',
                        value: `\`\`\`txt\n${problemText}\n\`\`\``
                    }
                ]
            }]
        }).catch(() => {
            messageResponde = '❌ | Erro ao enviar o reporte ao canal principal.'
        })

        return await this.interaction.reply({
            content: messageResponde,
            ephemeral: true
        })

    }

}