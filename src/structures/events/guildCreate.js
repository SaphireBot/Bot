import { SaphireClient as client, Database } from '../../classes/index.js'
import { Config, Config as config } from '../../util/Constants.js'
import { Emojis as e } from '../../util/util.js'

client.on("guildCreate", async guild => {

    if (!client.allGuilds.find(g => g.id === guild.id)) {
        client.allGuilds.push(client.guilds.resolve(guild.id))
        await guild.fetch()
    }

    const clientData = await Database.Client.findOne({ id: client.user.id }, 'Blacklist')
    const blacklistServers = clientData?.Blacklist?.Guilds || []

    if (blacklistServers.some(data => data?.id === guild.id))
        return guild.leave()
            .catch(async err => {
                const owner = await client.users.fetch(config.ownerId).catch(() => null)
                return owner?.send(`${e.Deny} | Não foi possível sair da ${guild.id} \`${guild.id}\` que está na blacklist.\n> \`${err}\``).catch(() => { })
            })

    const server = await Database.Guild.findOne({ id: guild.id })
    if (!server) await Database.registerServer(guild)

    const owner = await client.users.fetch(guild?.ownerId || "undefined").catch(() => null)

    client.pushMessage({
        channelId: Config.LogChannelId,
        method: 'post',
        body: {
            embeds: [{
                color: client.green,
                title: `${e.Loud} Servidor Adicionado`,
                fields: [
                    {
                        name: 'Status',
                        value: `**Dono:** ${owner?.tag || '`Not Found`'} *\`${guild?.ownerId || '0'}\`*\n**Membros:** ${guild.memberCount}`
                    },
                    {
                        name: 'Register',
                        value: `O servidor ${guild.name} foi registrado com sucesso!`
                    }
                ]
            }]
        }
    })

    const FirstMessageChannel = guild.channels.cache.find(channel => channel.isTextBased() && channel.permissionsFor(guild.members.me).has('SendMessages'))
    if (!FirstMessageChannel) return
    return FirstMessageChannel.send(`${e.NezukoDance} | Oooie, eu sou a ${client.user.username}.\n${e.Stonks} | Meu prefixo padrão é \`/\`, todos os meus são em Slash Commands.`).catch(() => { })

})