import {
    SaphireClient as client,
    Database
} from '../../classes/index.js'
import { Config as config } from '../../util/Constants.js'
import { Emojis as e } from '../../util/util.js'

client.on("guildCreate", async guild => {

    if (!client.allGuilds.find(g => g.id === guild.id)) {
        client.allGuilds.push(client.guilds.resolve(guild.id))
        await guild.members.fetch()
    }

    const clientData = await Database.Client.findOne({ id: client.user.id }, 'Blacklist')
    const blacklistServers = clientData?.Blacklist?.Guilds || []

    if (blacklistServers.some(data => data?.id === guild.id))
        return guild.leave().catch(async err => {
            const owner = await client.users.fetch(config.ownerId).catch(() => null)
            return owner?.send(`${e.Deny} | Não foi possível sair da ${guild.id} \`${guild.id}\` que está na blacklist.\n> \`${err}\``).catch(() => { })
        })

    Hello(); SendAdder()
    const server = await Database.Guild.findOne({ id: guild.id })
    if (!server) await Database.registerServer(guild)

    async function Hello() {
        const FirstMessageChannel = guild.channels.cache.find(channel => channel.isTextBased() && channel.permissionsFor(guild.members.me).has('SendMessages'))

        if (!FirstMessageChannel) return
        else return FirstMessageChannel.send(`${e.NezukoDance} | Oooie, eu sou a ${client.user.username}.\n${e.SaphireObs} | Meu prefiro padrão é \`/\`, todos os meus são em Slash Commands.`)
    }

    async function SendAdder() {

        if (!guild.members.me.permissions.has('ViewAuditLog')) return

        const fetchedLogs = await guild.fetchAuditLogs({ limit: 1, type: 28 }) // type: 'BotAdd'
        const guildLog = fetchedLogs.entries.first()

        if (!guildLog) return

        const { executor, target } = guildLog

        if (target.id !== client.user.id || !executor) return

        return executor.send(`${e.SaphireHi} Oiiee.\n \nJá que foi você que me adicionou no servidor ${guild.name}, quero dizer que você pode personalizar e ativar vários comandos indo no painel \`/help\` na sessão **Configurações** e também em **Servidor**.\n \nQualquer problema, você pode entrar no meu servidor que a Saphire's Team vai te ajudar em tudo.\n \n*Obs: Caso eu tenha saído do servidor, isso quer dizer que o servidor "${guild.name}" está na blacklist.*\n${config.SupportServerLink}\n${config.MoonServerLink}\n${config.PackageInvite}`).catch(() => { })
    }
})