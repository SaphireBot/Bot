import { ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, version as DiscordJsVersion } from 'discord.js'
import { Database, SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e, Byte } from "../../../../util/util.js"
import { readFileSync } from 'fs'
import { Config } from "../../../../util/Constants.js"
import { socket } from "../../../../websocket/websocket.js"
import os from 'os'
const packageData = JSON.parse(readFileSync('./package.json'))
let timeouts = []
const Timeouts = {}
const awaiting = {}

/**
 * @param { ChatInputCommandInteraction | ButtonInteraction } interaction
 */
export default async (interaction, commandData) => {

    if (commandData && commandData?.userId !== interaction.user.id)
        return interaction.reply({
            content: `${e.Deny} | Calma calma, só <@${commandData.userId}> pode clicar aqui, ok?`,
            ephemeral: true
        })

    let message = undefined

    if (awaiting[interaction.user.id] && Timeouts[interaction.user.id] >= 5000)
        return interaction.reply({ content: `⏱️ | Você abusou muito desse comando... Você está sofrendo um cooldown de mais de ${Date.stringDate(Timeouts[interaction.user.id])}, ok?` })

    if (awaiting[interaction.user.id])
        return interaction.reply({ content: `${e.Deny} | [SYSTEM INFO COOLDOWN] | Você já tem uma solicitação em aberto, ok?`, ephemeral: true })

    const button = {
        type: 1,
        components: [
            {
                type: 2,
                label: 'Atualizando...',
                emoji: e.Loading,
                custom_id: 'refreshing',
                style: ButtonStyle.Primary,
                disabled: true
            }
        ]
    }

    if (timeouts.some(userId => userId == interaction.user.id)) {
        Timeouts[interaction.user.id] ? Timeouts[interaction.user.id] += 700 : Timeouts[interaction.user.id] = 2500
        awaiting[interaction.user.id] = true

        message = commandData
            ? await interaction.update({ components: [button], fetchReply: true }).catch(() => { })
            : await interaction.reply({ components: [button], fetchReply: true }).catch(() => { })

        return setTimeout(() => sendData(), Timeouts[interaction.user.id] || 0)
    } else {
        if (!Timeouts[interaction.user.id]) Timeouts[interaction.user.id] = 2500

        message = commandData
            ? await interaction.update({ components: [button], fetchReply: true }).catch(() => { })
            : await interaction.reply({ components: [button], fetchReply: true }).catch(() => { })

        return sendData()
    }

    async function sendData() {
        timeouts.push(interaction.user.id)
        awaiting[interaction.user.id] = true

        const twitchData = await socket
            ?.timeout(1500)
            .emitWithAck("twitchdata", "get")
            .catch(() => null)

        const shard = await client.shard.broadcastEval(shard => ({
            allUsers: shard.users.cache.size,
            allGuilds: shard.guilds.cache.size,
            allChannels: shard.channels.cache.size,
            allEmojis: shard.emojis.cache.size
        }))
            .catch(() => ([{
                allUsers: client.users.cache.size,
                allUsers: 0,
                allGuilds: client.guilds.cache.size,
                allChannels: client.channels.cache.size,
                allEmojis: client.emojis.cache.size
            }]))

        const shardData = shard.reduce((prev, cur) => {
            prev.allUsers += cur.allUsers
            prev.allGuilds += cur.allGuilds
            prev.allChannels += cur.allChannels
            prev.allEmojis += cur.allEmojis
            return prev
        }, {
            allUsers: 0,
            allGuilds: 0,
            allChannels: 0,
            allEmojis: 0
        })

        const commands = await socket?.timeout(2000).emitWithAck("getSaphireData", "all").catch(() => null)

        const data = {
            developer: await client.users.fetch(Config.ownerId || '0').then(user => `${user.username} - ${Config.ownerId}`).catch(() => `Rody#1000 - ${Config.ownerId}`),
            usersShardInCache: client.users.cache.size || 0,
            guildsShardInCache: client.guilds.cache.size || 0,
            channelsShardInCache: client.channels.cache.size || 0,
            emojisShardInCache: client.emojis.cache.size || 0,
            allUsers: shardData.allUsers,
            allGuilds: shardData.allGuilds,
            allChannels: shardData.allChannels,
            allEmojis: shardData.allEmojis,
            version: process.env.SAPHIRE_ID == client.user.id ? 'Saphire' : 'Canary',
            uptime: Date.stringDate(client.uptime),
            ping: `${client.ws.ping}ms`,
            commandsSize: client.slashCommands.size || 0,
            greetingTime: getGreetingTime(),
            emojisHandlerCount: Object.keys(e).length,
            hostname: os.hostname(),
            archtecture: os.arch(),
            processor: os.cpus()[0].model,
            platform: os.platform(),
            totalMen: os.totalmem(),
            popularCommands: Object
                .entries(commands?.commands || client.commandsUsed)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([cmdName, count]) => `${cmdName}: ${count}`)
                .join('\n'),
            popularCommandsTotal: Object.values(commands?.commands || client.commandsUsed).reduce((a, b) => a += b, 0)
        }

        const userTag = interaction.user.username

        const rankingHi = [
            `Eai ${userTag},`,
            `Tudo bom ${userTag}?`,
            `Alô ${userTag},`,
            `Hey hey ${userTag},`,
            `Eai ${userTag}, como tem passado?`,
            `Olá ${userTag},`,
            `Opa ${userTag},`,
            `Oi oi ${userTag},`,
            `Aoba ${userTag},`,
            `Coé ${userTag},`
        ].random()

        const clientData = await Database.Client.findOne({ id: client.user.id }, 'TwitchNotifications')
        const TwitchNotifications = (clientData?.TwitchNotifications || 0) + (twitchData?.notifications || 0)

        const embed = {
            color: client.blue,
            title: `🔎 Minhas Informações Técnicas`,
            description: `${rankingHi} ${data.greetingTime}.`,
            fields: [
                {
                    name: '📜 Números do Cliente',
                    value: `\`\`\`txt\nShard: ${client.shardId}\nUsuários: ${data.usersShardInCache}\nServidores: ${data.guildsShardInCache}\nCanais: ${data.channelsShardInCache}\nEmojis: ${data.emojisShardInCache}\nCluster: ${client.clusterName}\n\`\`\``,
                    inline: true
                },
                {
                    name: '🧩 Números das Shards',
                    value: `\`\`\`txt\nShards: ${client.shard.count}\nUsuários: ${data.allUsers}\nServidores: ${data.allGuilds}\nCanais: ${data.allChannels}\nEmojis: ${data.allEmojis}\nClusters: 2${"".padEnd(3)}\n\`\`\``,
                    inline: true
                },
                {
                    name: `${e.discloud} Hospedagem`,
                    value: `\`\`\`txt\nProcessador: ${data.processor}\nArquitetura: ${data.archtecture}\nPlataforma: ${data.platform}\nTotal RAM: ${new Byte(data.totalMen)}\n\`\`\``,
                    inline: true
                },
                {
                    name: '⚙️ Desenvolvimento',
                    value: `\`\`\`txt\nCriação: ${Date.stringDate(Date.now() - client.user.createdTimestamp)}\nLinguagem: JavaScript ES6 Modules\nLivraria: Discord.js (${DiscordJsVersion})\nAmbiente: Node.js (${process.version})\nClient Version: ${data.version} (${packageData.version || 'Primary'})\nHost: discloud.app\n\`\`\``,
                    inline: false
                },
                {
                    name: '🛰️ Informações Gerais',
                    value: `\`\`\`txt\nShard Ping: ${data.ping}\nTempo Online: ${data.uptime}\nCriador: ${data.developer}\nComandos: ${data.commandsSize} disponíveis\nMensagens: ${(commands?.messages || client.messages)?.currency()}\nInterações: ${(commands?.count || client.interactions)?.currency()}\nEmoji Handler: ${data.emojisHandlerCount}\n\`\`\``,
                    inline: false
                },
                {
                    name: `${e.slash} Comandos Populares`,
                    value: `\`\`\`txt\n${data.popularCommands}\nTotal: ${data.popularCommandsTotal}\n\`\`\``,
                    inline: true
                },
                {
                    name: `${e.twitch} Twitch System`,
                    value: `\`\`\`txt\nStreamers: ${(twitchData?.streamersOffline?.length + twitchData?.streamersOnline?.length) || "??"}\nNotificações Enviadas: ${TwitchNotifications || "??"}\nStreamers Online: ${twitchData?.streamersOnline?.length || "??"}\nStreamers Offline: ${twitchData?.streamersOffline?.length || '??'}\nServidores Registrados: ${twitchData?.allGuildsID?.length || "??"}\nRequisições em Espera: ${twitchData?.awaitingRequests || "??"}\n\`\`\``,
                    inline: true
                }
            ],
            footer: {
                text: `💚 Powered by discloud.app | From Cluster ${client.clusterName}`
            }
        }

        const button = {
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Cooldown',
                    emoji: e.Loading,
                    custom_id: JSON.stringify({ c: 'botinfo', userId: interaction.user.id }),
                    style: ButtonStyle.Primary,
                    disabled: true
                }
            ]
        }

        message = commandData
            ? await interaction.message.edit({ content: null, embeds: [embed], components: [button] }).catch(() => resend(embed))
            : await interaction.editReply({ content: null, embeds: [embed], components: [button], fetchReply: true }).catch(() => resend(embed))
        return removeTimeout(button)
    }

    function resend(embed) {
        return interaction.channel.send({ content: null, embeds: [embed], components: [button] })
    }

    function getGreetingTime() {
        const data = [
            { hour: [0, 1, 2, 3, 4, 5], reply: 'Boa madrugada' },
            { hour: [6, 7, 8, 9, 10, 11], reply: 'Bom dia' },
            { hour: [12, 13, 14, 15, 16, 17], reply: 'Boa tarde' },
            { hour: [18, 19, 20, 21, 22, 23], reply: 'Boa noite' },
        ].find(value => value.hour.includes(new Date().getHours()))
        return data.reply // 'Boa madrugada' | 'Bom dia' | 'Boa tarde' | 'Boa noite'
    }

    function removeTimeout(button) {
        setTimeout(() => {
            button.components[0].disabled = false
            button.components[0].label = 'Atualizar Dados'
            button.components[0].emoji = '🔄'
            button.components.push({
                type: 2,
                label: 'Ping',
                emoji: '🏓',
                custom_id: JSON.stringify({ c: 'ping' }),
                style: ButtonStyle.Primary
            })
            message.edit({ components: [button] }).catch(() => { })
            delete awaiting[interaction.user.id]
            timeouts = timeouts.filter(userId => userId != interaction.user.id)
        }, Timeouts[interaction.user.id] || 0)
        return;
    }
}