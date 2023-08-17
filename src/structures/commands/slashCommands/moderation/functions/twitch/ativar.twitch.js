import { ButtonStyle, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js"
import { Emojis as e } from '../../../../../../util/util.js'
import { Database, SaphireClient as client } from "../../../../../../classes/index.js"
import { PermissionsTranslate } from "../../../../../../util/Constants.js"
import accept from '../../../../../classes/buttons/twitch/accept.twitch.js'

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    const { options, guild, user } = interaction
    let streamer = options.getString('streamers')
    const channel = options.getChannel('canal_do_servidor')
    const role = options.getRole('cargo_a_ser_mencionado')
    const customMessage = options.getString('mensagem_de_notificação')

    const channelPermissions = channel.permissionsFor(client.user)
    const permissions = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
    const greenCard = Array.from(
        new Set([
            guild.members.me.permissions.missing(permissions),
            channelPermissions?.missing(permissions)
        ].flat())
    )

    if (greenCard.length)
        return interaction.reply({
            content: `${e.Animated.SaphireCry} | Eu não tenho todas as permissões necessárias.\n${e.Info} | Permissões faltando: ${greenCard.map(perm => `\`${PermissionsTranslate[perm || perm]}\``).join(', ') || 'Nenhuma? WTF'}`
        }).catch(() => { })

    let streamers = Array.from(
        new Set(
            streamer
                .toLowerCase()
                .split(/(?:(?:https?:\/\/(?:www\.)?(?:m\.)?twitch\.tv\/)|\W+)/)
                .filter(NoEmptyStrings => NoEmptyStrings)
        )
    )
        .slice(0, 100)

    const result = await client.TwitchFetcher(`https://api.twitch.tv/helix/users?${streamers.map(str => `login=${str}`).join('&')}`)

    if (result == 'TIMEOUT')
        return interaction.reply({
            content: `${e.Animated.SaphirePanic} | Aaaaah, o sistema da Twitch está pegando FOOOOGO 🔥\n🧑‍🚒 | Fica tranquilo, que tudo está normal em menos de 1 minuto. ||Rate limit é uma coisinha chata||`
        })

    if (!result || !result.length)
        return await interaction.reply({
            content: `${e.DenyX} | Nenhum dos ${streamers.length} streamers que você passou existe na Twitch.`
        })

    const dataFromDatabase = await Database.getGuild(guild.id) // [{ streamer: 'alanzoka', channelId: '123' }]
    const notifications = dataFromDatabase?.TwitchNotifications || []

    const data = result.map(str => {
        str.channelId = notifications.find(d => d.streamer == str.login)?.channelId || null
        return str
    })

    const commandData = []

    for (const s of data)
        commandData.push({
            streamer: s.login,
            username: s.display_name,
            channelId: channel.id,
            roleId: role?.id,
            oldChannelId: s.channelId,
            message: customMessage ? customMessage.replace(/\$streamer/g, s.login).replace(/\$role/g, role ? `<@&${role.id}>` : '') : undefined
        })

    const embed = {
        color: client.blue,
        title: `${e.twitch} ${client.user.username}'s Twitch System Notification`,
        description: data.map(s => `👤 [${s.display_name}](${`https://www.twitch.tv/${s.login}`}) \`${(s.view_count || 0).currency()} Views\`${s.channelId ? ` -> <#${s.channelId}>` : ''}`).join('\n'),
        fields: [
            {
                name: `${e.Info} Informações`,
                value: `Canal de Notificação: ${channel} \`${channel.id}\`\nCargo: ${role ? `${role} \`${role.id}\`` : 'Nenhum'}\nMensagem Customizada: ${commandData[0].message ? commandData[0].message : `${e.Notification} **${commandData[0].streamer}** está em live na Twitch.`}`
            }
        ],
        footer: {
            text: `${result.length}/${streamers.length} Streamers Válidos`
        }
    }

    return interaction.reply({
        embeds: [embed],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Confirmar',
                        emoji: e.CheckV,
                        custom_id: 'accept',
                        style: ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: 'Cancelar',
                        emoji: e.DenyX,
                        custom_id: JSON.stringify({ c: 'delete' }),
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ],
        fetchReply: true
    })
        .then(msg => collector(msg))
        .catch(() => { })

    function collector(msg) {
        return msg.createMessageComponentCollector({
            filter: int => int.user.id == user.id,
            time: 1000 * 60 * 10,
            max: 1
        })
            .on('collect', async int => {
                if (int.customId == 'accept') return accept(int, commandData)
            })
            .on('end', (_, reason) => {
                if (reason != 'time') return
                return msg.edit({ content: '⏱️ | Tempo esgotado.', components: [] })
            })
    }

}