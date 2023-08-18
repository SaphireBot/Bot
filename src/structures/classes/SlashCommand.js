import { ChatInputCommandInteraction } from 'discord.js'
import { Experience } from '../../classes/index.js'
import * as Statcord from 'statcord.js'
import error from '../../classes/modules/errors/errors.js'
import Base from './Base.js'
import { socket } from '../../websocket/websocket.js'

export default class SlashCommandInteraction extends Base {
    /**
     * @param { ChatInputCommandInteraction } interaction 
     */
    constructor(interaction) {
        super()
        this.interaction = interaction
        this.user = interaction.user
        this.member = interaction.member
        this.guild = interaction.guild
        this.channel = interaction.channel
        this.commandName = interaction.commandName
        this.e = this.emojis
        this.guildData = {}
        this.clientData = {}
        this.clientData = {}
        this.Moeda = ""
    }

    execute(command) {

        Experience.add(this.user.id, 5)

        return command.execute(this)
            ?.then(() => this.registerCommand(command.name))
            .catch(err => error(this, err))
    }

    CheckBeforeExecute() {

        const command = this.client.slashCommands.get(this.commandName);
        if (!command)
            return this.interaction.reply({
                content: `${this.e.Animated.SaphireSleeping} | Eu ainda estou acordando, pode usar o comando de novo?`,
                ephemeral: true
            })

        this.client.commandsUsed[command.name]++
        if (command.admin && ![...this.client.admins, this.config.ownerId].includes(this.user.id))
            return this.interaction.reply({
                content: `${this.e.Deny} | Este comando é exclusivo para meus administradores.`,
                ephemeral: true
            })

        if (command.staff && !this.client.staff.includes(this.user.id))
            return this.interaction.reply({
                content: `${this.e.Deny} | Este comando é exclusivo para os membros da equipe Saphire's Team.`,
                ephemeral: true
            })
        return command.database === false ? this.execute(command) : this.checkAndDefineDatabase(command)
    }

    async checkAndDefineDatabase(command) {

        const { guild, e, Database, interaction, user } = this
        const guildData = await Database.getGuild(guild?.id)

        if (!guildData && guild) {
            Database.registerServer(guild)
            return interaction.reply({
                content: `${e.Database} | DATABASE | Registro do servidor no banco de dados efetuado com sucesso. Por favor, use novamente o comando.`
            })
        }

        const clientData = this.client.clientData

        if (clientData.Rebooting?.ON)
            return interaction.reply({ content: `${e.Loading} | Reiniciando em breve...\n${e.Commands} | ${clientData.Rebooting?.Features || 'Nenhum dado fornecido'}` })

        if (clientData?.Blacklist?.Users?.some(data => data?.id === user.id))
            return interaction.reply({ content: `${e.Deny} | Você está na blacklist.`, ephemeral: true })

        const comandosBloqueados = clientData?.ComandosBloqueadosSlash || []
        const cmdBlocked = comandosBloqueados?.find(Cmd => Cmd.cmd === interaction.commandName)

        if (cmdBlocked)
            return interaction.reply({
                content: `${e.Animated.SaphireReading} | Este Slash Command foi bloqueado por algum Bug/Erro ou pelos meus administradores.\n> Quer fazer algúm reporte? Use o comando \`/bug\`\n> Motivo do bloqueio: ${cmdBlocked?.error || 'Motivo não informado.'}`.limit('MessageContent'),
                ephemeral: true
            })

        this.Moeda = guildData?.Moeda || `${e.Coin} Safiras`
        this.guildData = guildData
        this.clientData = clientData
        return this.execute(command)
    }

    registerCommand(commandName) {

        if (
            !commandName,
            !this.guild?.id
            || !this.user?.id
            || !this.channel?.id
        ) return

        Statcord.ShardingClient.postCommand(commandName, this.user.id, this.client)

        socket?.send({ type: "registerCommand", commandName })

        this.client.registerCommand({
            commandName,
            channelId: this.channel.id,
            guildId: this.guild.id,
            userId: this.user.id,
            date: new Date(),
            type: 'SlashCommand'
        })

        return
    }

}