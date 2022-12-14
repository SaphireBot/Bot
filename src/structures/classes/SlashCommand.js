import Base from './Base.js'
import error from '../../classes/modules/errors/errors.js'
import * as Statcord from 'statcord.js'
import { Emojis } from '../../util/util.js'
import { Experience } from '../../classes/index.js'

export default class SlashCommand extends Base {
    constructor(interaction) {
        super()
        this.interaction = interaction
        this.user = interaction.user
        this.member = interaction.member
        this.guild = interaction.guild
        this.channel = interaction.channel
        this.commandName = interaction.commandName
        this.e = Emojis
    }

    async execute(guildData, clientData) {

        this.guildData = guildData
        this.clientData = clientData
        Experience.addXp(this.user.id, 5)

        const command = this.client.slashCommands.get(this.commandName);
        if (!command) return

        if (command.admin && !this.client.admins.includes(this.user.id))
            return await this.interaction.reply({
                content: `${this.e.Deny} | Este comando é exclusivo para meus administradores.`,
                ephemeral: true
            })

        if (command.staff && !this.client.staff.includes(this.user.id))
            return await this.interaction.reply({
                content: `${this.e.Deny} | Este comando é exclusivo para os membros da equipe Saphire's Team.`,
                ephemeral: true
            })

        return command.execute(this)
            .then(() => this.registerCommand(command.name))
            .catch(err => error(this, err))
    }

    async CheckBeforeExecute() {

        const { guild, e, Database, interaction, user, channel, client } = this

        const guildData = await Database.Guild.findOne({ id: guild?.id })

        if (!guildData && guild) {
            await Database.registerServer(guild)
            return await interaction.reply({
                content: `${e.Database} | DATABASE | Registro do servidor no banco de dados efetuado com sucesso.`
            })
        }

        const clientData = await Database.Client.findOne({ id: client.user.id })

        if (!clientData) {
            await Database.registerClient(client.user.id)
            return await interaction.reply({
                content: `${e.Database} | Por favor, tente novamente. Alguns dados não foram encontrados.`,
                ephemeral: true
            })
        }

        this.clientData = clientData
        if (clientData.Rebooting?.ON)
            return await interaction.reply({ content: `${e.Loading} | Reiniciando em breve...\n${e.BookPages} | ${clientData.Rebooting?.Features || 'Nenhum dado fornecido'}` })

        if (clientData?.Blacklist?.Users?.some(data => data?.id === user.id))
            return await interaction.reply({ content: `${e.Deny} | Você está na blacklist.`, ephemeral: true })

        if (!this.member?.isAdm && guildData?.Blockchannels?.Channels?.includes(channel.id))
            return await interaction.reply({ content: `${e.Deny} | Meus comandos foram bloqueados neste canal.`, ephemeral: true })

        const comandosBloqueados = clientData?.ComandosBloqueadosSlash || []
        const cmdBlocked = comandosBloqueados?.find(Cmd => Cmd.cmd === interaction.commandName)

        if (cmdBlocked)
            return await interaction.reply({
                content: `${e.saphireLendo} | Este Slash Command foi bloqueado por algum Bug/Erro ou pelos meus administradores.\n> Quer fazer algúm reporte? Use o comando \`/bug\`\n> Motivo do bloqueio: ${cmdBlocked?.error || 'Motivo não informado.'}`,
                ephemeral: true
            })

        this.Moeda = guildData?.Moeda || `${e.Coin} Safiras`
        return this.execute(guildData, clientData)
    }

    async registerCommand(commandName) {

        Statcord.ShardingClient.postCommand(commandName, this.user.id, this.client)
        await this.Database.Cache.Commands.push(`${this.user.id}.${commandName}`, Date.now())

        return await this.Database.Client.updateOne(
            { id: this.client.user.id },
            {
                $inc: {
                    ComandosUsados: 1,
                    [`CommandsCount.${commandName}`]: 1
                }
            },
            { upsert: true }
        )
    }
}
