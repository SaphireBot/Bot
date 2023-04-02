import { ButtonStyle, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js"
import { Emojis as e } from '../../../../../../util/util.js'
import { Database, TwitchManager, SaphireClient as client } from "../../../../../../classes/index.js"
import { PermissionsTranslate } from "../../../../../../util/Constants.js"
import accept from '../../../../../classes/buttons/twitch/accept.twitch.js'

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    if (TwitchManager.requests >= 95) {
        await interaction.reply({
            content: `${e.Loading} | Sistema sob proteção de rate limit, por favor, espere 1 minuto... Vou continuar automáticamente...`
        })
        const interval = setInterval(() => check(), 2000)

        function check() {
            if (TwitchManager.requests < 90) {
                clearInterval(interval)
                return next()
            }
            return
        }

    }
    else {
        await interaction.reply({
            content: `${e.Loading} | Carregando informações...`
        })
        return next()
    }

    async function next() {

        const { options, guild, user } = interaction
        let streamer = options.getString('streamer')
        const channel = options.getChannel('canal_do_servidor')
        const role = options.getRole('cargo_a_ser_mencionado')
        const customMessage = options.getString('mensagem_de_notificação')

        const channelPermissions = await channel.permissionsFor(client.user)
        const permissions = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
        const greenCard = Array.from(
            new Set([
                guild.members.me.permissions.missing(permissions),
                channelPermissions?.missing(permissions)
            ].flat())
        )

        if (greenCard.length)
            return interaction.editReply({
                content: `${e.cry} | Eu não tenho todas as permissões necessárias.\n${e.Info} | Permissões faltando: ${greenCard.map(perm => `\`${PermissionsTranslate[perm || perm]}\``).join(', ') || 'Nenhuma? WTF'}`
            }).catch(() => { })

        if (streamer.includes('www.twitch.tv/')) {
            const url = streamer.split('/').at(-1)
            streamer = url
        }

        const exist = await TwitchManager.fetcher(`https://decapi.me/twitch/id/${streamer}`)
            .then(res => res.text())
            .catch(() => null)

        if (!exist || exist.includes('not found'))
            return interaction.editReply({
                content: `${e.DenyX} | O streamer solicitado da Twitch não existe.`
            }).catch(() => { })

        const data = await Database.Guild.findOne({ id: guild.id }, 'TwitchNotifications')
        const notifications = data?.TwitchNotifications || []
        const hasConfig = notifications.find(tw => tw?.streamer == streamer)

        const commandData = {
            streamer,
            channelId: channel.id,
            roleId: role?.id,
            message: customMessage ? customMessage.replace(/\$streamer/g, streamer).replace(/\$role/g, role ? `<@&${role.id}>` : '') : undefined
        }

        if (
            hasConfig?.channelId == channel.id
            && hasConfig?.streamer == streamer
            && hasConfig?.roleId == commandData.roleId
            && hasConfig?.message == commandData.message
        )
            return await interaction.reply({
                content: `${e.DenyX} | Ueeepa. Eu vi aqui que o streamer **${streamer}** já está configurado neste servidor, acredita?\n${e.Notification} | Adivinha! Todas as configurações passadas são idênticas!`
            }).catch(() => { })

        const msg = await interaction.editReply({
            content: `${e.Info} | Toda vez que o/a streamer **${streamer}** estiver em live, eu vou enviar uma notificação no canal ${channel}.\n💬 | A mensagem personalizada é essa aqui: "${commandData.message || `${e.Notification} | **${streamer}** está em live na Twitch.`}".\n${e.Warn} | *Lembrado que por segurança, o delay da notificação pode demorar de 5 segundos a 10 minutos.*${hasConfig?.channelId ? `\n${e.Info} | **${streamer}** está configurado no canal <#${hasConfig?.channelId}>${hasConfig?.roleId ? ` com menção ao cargo <@&${hasConfig?.roleId}>` : ''}.` : ''}`,
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
                        },
                        {
                            type: 2,
                            label: 'Conferir Canal na Twitch',
                            emoji: '🔗',
                            url: `https://www.twitch.tv/${streamer}`,
                            style: ButtonStyle.Link
                        }
                    ]
                }
            ],
            fetchReply: true
        }).catch(() => { })

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
                return msg.edit({ content: '⏱️ | Tempo esgotado.', components: [] }).catch(() => { })
            })

    }

}