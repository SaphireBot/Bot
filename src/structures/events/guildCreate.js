import { SaphireClient as client, Database } from '../../classes/index.js';
import { ButtonStyle, parseEmoji } from 'discord.js';
import { Emojis as e } from '../../util/util.js';
import { socket } from '../../websocket/websocket.js';
import { Config} from '../../util/Constants.js';

client.on("guildCreate", async guild => {

    if (client.blacklist.has(guild.id))
        return guild.leave().catch(() => { })

    if (socket?.connected)
        socket?.send({
            type: "guildCreate",
            guilds: {
                id: guild.id,
                name: guild.name,
                icon: guild.icon,
                owner: guild.ownerId == client.user.id,
                permissions: guild.members.me.permissions,
                features: guild.features
            }
        })

    const server = await Database.getGuild(guild.id)
    if (!server) await Database.registerServer(guild)

    const owner = await client.users.fetch(guild?.ownerId || "undefined").catch(() => null)
    const invite = await guild.invites.create(guild.channels.cache.random()?.id, { temporary: false }).catch(() => null)

    const components = [
        {
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Server Info',
                    emoji: parseEmoji("📋"),
                    custom_id: JSON.stringify({ c: 'sinfo', src: 'info', id: guild.id }),
                    style: ButtonStyle.Primary
                }
            ]
        }
    ]

    if (invite)
        components[0].components.push({
            type: 2,
            label: 'Guild Invite',
            emoji: parseEmoji("🖇️"),
            url: invite.url,
            style: ButtonStyle.Link
        })

    components[0].components.push({
        type: 2,
        label: 'Remove',
        emoji: parseEmoji("🛡️"),
        custom_id: JSON.stringify({ c: 'admin', src: 'removeGuild', id: guild.id }),
        style: ButtonStyle.Danger
    })

    client.pushMessage({
        channelId: Config.LogChannelId,
        method: 'post',
        body: {
            channelId: Config.LogChannelId,
            method: 'post',
            embeds: [{
                color: client.green,
                title: `${e.Loud} Servidor Adicionado`,
                fields: [
                    {
                        name: 'Status',
                        value: `**Dono:** ${owner?.username || '`Not Found`'} *\`${guild?.ownerId || '0'}\`*\n**Membros:** ${guild.memberCount}`
                    },
                    {
                        name: 'Register',
                        value: `O servidor ${guild.name} foi registrado com sucesso!`
                    }
                ]
            }],
            components
        }
    })

    const FirstMessageChannel = guild.channels.cache.find(channel => channel.isTextBased() && channel.permissionsFor(guild.members.me).has('SendMessages'))
    if (!FirstMessageChannel) return
    return FirstMessageChannel.send(`${e.NezukoDance} | Oooie, eu sou a ${client.user.username}.\n${e.Stonks} | Meu prefixo padrão é \`/\`, todos os meus são em Slash Commands.`).catch(() => { })

})