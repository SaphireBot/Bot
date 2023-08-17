import { ButtonStyle, parseEmoji } from 'discord.js'
import { SaphireClient as client, Database } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'
import newMember from './functions/add.guildMemberAdd.js'
import executeAutorole from './system/execute.autorole.js'

client.on('guildMemberAdd', async member => {

    if (!member.guild.available) return

    const guildData = await Database.getGuild(member.guild.id)
    if (!guildData) return Database.registerServer(member.guild)

    if (guildData.MinDay?.days) {
        if (guildData.MinDay?.days > 30 || guildData.MinDay?.days < 0)
            return resetMinDay()

        const accountDays = parseInt((new Date() - new Date(member.user.createdAt.valueOf())) / (1000 * 60 * 60 * 24))

        if (accountDays < guildData.MinDay?.days)
            return executePunishment(guildData?.MinDay?.punishment, accountDays)
    }

    if (guildData?.Autorole)
        executeAutorole({ member, guildData })

    if (guildData.WelcomeChannel?.channelId)
        newMember(member, guildData.WelcomeChannel)

    // MinDayFunction
    async function resetMinDay() {
        await Database.Guild.findOneAndUpdate(
            { id: member.guild.id },
            { $unset: { MinDay: true } },
            { upsert: true, new: true }
        )
            .then(data => Database.saveGuildCache(data?.id, data))
        return
    }

    // MinDayFunction
    async function executePunishment(punishment, days) {

        const punishmentString = {
            kick: 'Expulsão (Kick)',
            ban: 'Banimento (Ban)',
            warn: 'Apenas um aviso (Warn)'
        }[punishment] || "Nenhuma"

        member.user.send({
            content: `${e.saphirePolicial} | O servidor **${member.guild.name}** \`${member.guild.id}\` definiu que apenas membros com a conta com mais de **${guildData.MinDay?.days} dias** pode entrar.\n${e.Animated.SaphireReading} | Você tem apenas **${days} dias** de conta, é uma pena...\n${e.Info} | Punição aplicada: **\`${punishmentString}\`**`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'MinDay System',
                            emoji: parseEmoji(e.Animated.SaphireReading),
                            url: 'https://docs.saphire.one/sistemas-automaticos/minday-system',
                            style: ButtonStyle.Link
                        }
                    ]
                }
            ]
        })
            .catch(() => { })

        if (punishment == 'kick') {
            const kicked = member.kickable
                ? member.kick(`Dias de conta criada é menor que ${days}/${guildData.MinDay?.days} dias`).then(() => true).catch(() => false)
                : false
            client.pushMessage({
                channelId: guildData.LogSystem?.channel,
                method: 'post',
                body: {
                    channelId: guildData.LogSystem?.channel,
                    method: 'post',
                    content: '🛰️ | **Global System Notification** | MinDay System',
                    embeds: [{
                        color: kicked ? client.blue : client.red,
                        title: 'Dias Mínimos Permitidos',
                        description: `O usuário ${member.user.username} \`${member.user.id}\` possui apenas **${days} dias de conta criada**`,
                        fields: [
                            {
                                name: '🔨 Punição',
                                value: kicked ? 'Expulsão (Kick)' : 'Não foi possível expulsar este membro. Verifique se eu tenho permissão o suficiente'
                            }
                        ]
                    }]
                }
            })
            return
        }

        if (punishment == 'ban') {
            const banned = member.bannable
                ? member.ban({
                    reason: `Dias de conta criada é menor que ${days}/${guildData.MinDay?.days} dias`
                }).then(() => true).catch(() => false)
                : false
            client.pushMessage({
                channelId: guildData.LogSystem?.channel,
                method: 'post',
                body: {
                    channelId: guildData.LogSystem?.channel,
                    method: 'post',
                    content: '🛰️ | **Global System Notification** | MinDay System',
                    embeds: [{
                        color: banned ? client.blue : client.red,
                        title: 'Dias Mínimos Permitidos',
                        description: `O usuário ${member.user.username} \`${member.user.id}\` possui apenas **${days} dias de conta criada**`,
                        fields: [
                            {
                                name: '🔨 Punição',
                                value: banned ? 'Banimento (ban)' : 'Não foi possível banir este membro. Verifique se eu tenho permissão o suficiente'
                            }
                        ]
                    }]
                }
            })
            return
        }

        if (punishment == 'warn')
            client.pushMessage({
                channelId: guildData.LogSystem?.channel,
                method: 'post',
                body: {
                    channelId: guildData.LogSystem?.channel,
                    method: 'post',
                    content: '🛰️ | **Global System Notification** | MinDay System',
                    embeds: [{
                        color: banned ? client.blue : client.red,
                        title: 'Dias Mínimos Permitidos',
                        description: `O usuário ${member.user.username} \`${member.user.id}\` possui apenas **${days} dias de conta criada**`,
                    }]
                }
            })

        client.pushMessage({
            channelId: guildData.LogSystem?.channel,
            method: 'post',
            body: {
                channelId: guildData.LogSystem?.channel,
                method: 'post',
                content: '🛰️ | **Global System Notification** | MinDay System',
                embeds: [{
                    color: banned ? client.blue : client.red,
                    title: 'Dias Mínimos Permitidos',
                    description: `O usuário ${member.user.username} \`${member.user.id}\` possui apenas **${days} dias de conta criada**`,
                    fields: [
                        {
                            name: '🔨 Punição',
                            value: 'Nenhuma punição foi definida.'
                        }
                    ]
                }]
            }
        })

    }

    return;
})