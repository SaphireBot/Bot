import { SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e, Byte } from "../../../../util/util.js"
import { ButtonStyle, version as DiscordJsVersion } from 'discord.js'
import { Config } from "../../../../util/Constants.js"
import os from 'os'
let timeouts = []
const Timeouts = {}
const awaiting = {}

// SlashCommand & Button Interaction
export default async (interaction, commandData) => {

    let message = undefined

    if (awaiting[interaction.user.id] && Timeouts[interaction.user.id] >= 5000)
        return interaction.reply({ content: `⏱️ | Você abusou muito desse comando... Você está sofrendo um cooldown de mais de ${Date.stringDate(Timeouts[interaction.user.id])}, ok?` })

    if (awaiting[interaction.user.id])
        return interaction.reply({ content: `${e.Deny} | [SYSTEM INFO COOLDOWN] | Você já tem uma solicitação em aberto, ok?`, ephemeral: true })

    if (timeouts.some(userId => userId == interaction.user.id)) {
        Timeouts[interaction.user.id] ? Timeouts[interaction.user.id] += 700 : Timeouts[interaction.user.id] = 2500
        awaiting[interaction.user.id] = true

        message = await reply({
            content: commandData
                ? `${e.Loading} | Esse comando tem um intervalo de uso, ok?\n${e.SaphireDesespero} | Você está clicando muito rápido. Quanto mais rápido você clica, mais vou demorar para te responder.`
                : `${e.Loading} | Carregando informações... Você está usando esse comando muito rápido, sabia?`,
            fetchReply: true
        })

        return setTimeout(() => sendData(), Timeouts[interaction.user.id] || 0)
    } else {
        if (!Timeouts[interaction.user.id]) Timeouts[interaction.user.id] = 2500
        message = await reply({ content: commandData ? `${e.Loading} | Atualizando...` : `${e.Loading} | Carregando informações...`, fetchReply: true })
        return sendData()
    }

    async function sendData() {
        timeouts.push(interaction.user.id)
        awaiting[interaction.user.id] = true

        const data = {
            developer: await client.users.fetch(Config.ownerId || '0').then(user => `${user.tag} - ${Config.ownerId}`).catch(() => `Rody#1000 - ${Config.ownerId}`),
            shards: `${client.shardId}/${client.shard.count}`,
            usersShardInCache: client.users.cache.size || 0,
            guildsShardInCache: client.guilds.cache.size || 0,
            channelsShardInCache: client.channels.cache.size || 0,
            emojisShardInCache: client.emojis.cache.size || 0,
            allUsers: (await client.shard.broadcastEval(shard => shard.users.cache.size)).reduce((prev, acc) => prev + acc, 0),
            allGuilds: (await client.shard.broadcastEval(shard => shard.guilds.cache.size)).reduce((prev, acc) => prev + acc, 0),
            allChannels: (await client.shard.broadcastEval(shard => shard.channels.cache.size)).reduce((prev, acc) => prev + acc, 0),
            allEmojis: (await client.shard.broadcastEval(shard => shard.emojis.cache.size)).reduce((prev, acc) => prev + acc, 0),
            version: client.moonId == client.user.id ? 'Saphire' : 'Tester',
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
            memoryUsage: process.memoryUsage().heapUsed
        }

        const { primary, accumulate } = client.uptimeAllTime
        const timeDifference = primary.valueOf() // 100% all time online
        let result = (timeDifference / (Date.now() - accumulate)) * 100
        if (result > 100) result = 100

        const embed = {
            color: client.blue,
            title: `🔎 Minhas Informações Técnicas`,
            description: `${e.Check} Eai ${interaction.user}. Eu sou a ${client.user.username}, ${data.greetingTime}.`,
            fields: [
                {
                    name: `🧩 Números das Shards`,
                    value: `\`\`\`txt\nShards: ${data.shards}\nUsuários: ${data.usersShardInCache}/${data.allUsers}\nServidores: ${data.guildsShardInCache}/${data.allGuilds}\nCanais: ${data.channelsShardInCache}/${data.allChannels}\nEmojis: ${data.emojisShardInCache}/${data.allEmojis}\nOnline: ${result.toFixed(2)}%\n\`\`\``,
                    inline: true
                },
                {
                    name: '⚙️ Desenvolvimento e Construção',
                    value: `\`\`\`txt\nLinguagem: JavaScript ES6 Modules\nLivraria: Discord.js (${DiscordJsVersion})\nAmbiente: Node.js (${process.version})\nCluster: ${client.clusterName}\nClient Version: ${data.version}\nHost: discloud.app\n\`\`\``,
                    inline: true
                },
                {
                    name: '🛰️ Informações Gerais',
                    value: `\`\`\`txt\nShard Ping: ${data.ping}\nTempo Online: ${data.uptime}\nCriador: ${data.developer}\nComandos: ${data.commandsSize} disponíveis\nMensagens: ${client.messages}\nInterações: ${client.interactions}\n\`\`\``
                },
                {
                    name: `${e.discloud} Máquina de Hospedagem`,
                    value: `\`\`\`txt\nNome: ${data.hostname}\nProcessador: ${data.processor}\nArquitetura: ${data.archtecture}\nPlataforma: ${data.platform}\nRAM: ${new Byte(data.memoryUsage)}/${new Byte(data.totalMen)}\n\`\`\``
                }
            ],
            footer: {
                text: Timeouts[interaction.user.id] ? `Cooldown: ${Date.stringDate(Timeouts[interaction.user.id])}` : null
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
            ? await interaction.message.edit({ content: null, embeds: [embed], components: [button] }).catch(() => resend())
            : await interaction.editReply({ content: null, embeds: [embed], components: [button], fetchReply: true }).catch(() => resend())
        return removeTimeout(button)
    }

    function resend() {
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
            message.edit({ components: [button] }).catch(() => { })
            delete awaiting[interaction.user.id]
            timeouts = timeouts.filter(userId => userId != interaction.user.id)
        }, Timeouts[interaction.user.id] || 0)
        return;
    }

    async function reply({ content = null, embeds = [], components = [], ephemeral = false }) {
        return commandData
            ? await interaction.update({ content, embeds, components, fetchReply: true, ephemeral }).catch(() => { })
            : await interaction.reply({ content, embeds, components, fetchReply: true, ephemeral }).catch(() => { })
    }
}