import {
    Database,
    SaphireClient as client,
    GiveawayManager
} from '../../../../classes/index.js'
import { Emojis as e } from '../../../../util/util.js'
import { Colors } from '../../../../util/Constants.js'
import moment from 'moment'

export default async interaction => {

    const { options, user, guild, channel: intChannel } = interaction

    function day(tomorrow = false) {

        function FormatNumber(data) {
            return data < 10 ? `0${data}` : data
        }

        const date = new Date()
        date.setHours(date.getHours() - 3)

        if (tomorrow)
            date.setDate(date.getDate() + 1)

        let Mes = FormatNumber(date.getMonth() + 1)
        let Dia = FormatNumber(date.getDate())
        let Ano = date.getFullYear()

        return `${Dia}/${Mes}/${Ano}`
    }

    const Prize = options.getString('prize')
    const Time = options.getString('time')
    const Requisitos = options.getString('requires')
    const imageURL = options.getString('imageurl')
    const Channel = options.getChannel('channel')
    const color = Colors[options.getString('color')]
    const WinnersAmount = options.getInteger('winners') || 1
    let TimeMs = 0

    let Args = Time.trim().split(/ +/g)

    if (Args[0].includes('/') || Args[0].includes(':') || ['hoje', 'today', 'tomorrow', 'amanhã'].includes(Args[0]?.toLowerCase())) {

        let data = Args[0],
            hour = Args[1]

        if (['tomorrow', 'amanhã'].includes(data.toLowerCase()))
            data = day(true)

        if (['hoje', 'today'].includes(data.toLowerCase()))
            data = day()

        if (!hour && data.includes(':') && data.length <= 5) {
            data = day()
            hour = Args[0]
        }

        if (data.includes('/') && data.length === 10 && !hour)
            hour = '12:00'

        if (!data || !hour)
            return await interaction.reply({
                content: '❌ | A data informada para o sorteio não é correta. Veja alguma formas de dizer a data:\n> Formato 1: \`h, m, s\` - Exemplo: 1h 10m 40s *(1 hora, 10 minutos, 40 segundos)* ou \`1m 10s\`, \`2h 10m\`\n> Formato 2: \`30/01/2022 14:35:25\` - *(Os segundos são opcionais)*\n> Formato 3: \`hoje 14:35 | amanhã 14:35\`\n> Formato 4: \`14:35\` ou \`30/01/2022\`',
                ephemeral: true
            })

        let dataArray = data.split('/')
        let hourArray = hour.split(':')
        let dia = parseInt(dataArray[0])
        let mes = parseInt(dataArray[1]) - 1
        let ano = parseInt(dataArray[2])
        let hora = parseInt(hourArray[0])
        let minutos = parseInt(hourArray[1])
        let segundos = parseInt(hourArray[2]) || 0

        let date = moment.tz({ day: dia, month: mes, year: ano, hour: hora, minutes: minutos, seconds: segundos }, "America/Sao_Paulo")

        if (!date.isValid())
            return await interaction.reply({
                content: '❌ | O tempo informado não é válido. Verifique se você escreveu o tempo de forma correta.',
                ephemeral: true
            })

        date = date.valueOf()

        if (date < Date.now()) return await interaction.reply({
            content: '❌ | O tempo do lembrete deve ser maior que o tempo de "agora", não acha?',
            ephemeral: true
        })

        TimeMs += date - Date.now()

    } else
        for (let arg of Args) {

            if (arg.slice(-1).includes('d')) {
                let time = arg.replace(/d/g, '000') * 60 * 60 * 24
                if (isNaN(time)) return cancelReminder()
                TimeMs += parseInt(time)
                continue
            }

            if (arg.slice(-1).includes('h')) {
                let time = arg.replace(/h/g, '000') * 60 * 60
                if (isNaN(time)) return cancelReminder()
                TimeMs += parseInt(time)
                continue
            }

            if (arg.slice(-1).includes('m')) {
                let time = arg.replace(/m/g, '000') * 60
                if (isNaN(time)) return cancelReminder()
                TimeMs += parseInt(time)
                continue
            }

            if (arg.slice(-1).includes('s')) {
                let time = arg.replace(/s/g, '000')
                if (isNaN(time)) return cancelReminder()
                TimeMs += parseInt(time)
                continue
            }

            return cancelReminder()
            async function cancelReminder() {
                return await interaction.reply({
                    content: '❌ | Data inválida! Verifique se a data esta realmente correta: \`dd/mm/aaaa hh:mm\` *(dia, mês, ano, horas, minutos)*\nℹ | Exemplo: \`30/01/2022 14:35:25\` *(Os segundos são opcionais)*\nℹ | \`hoje 14:35\`\nℹ | \`Amanhã 14:35\`',
                    ephemeral: true
                })
            }
        }

    if (TimeMs > 2592000000)
        return await interaction.reply({
            content: `${e.Deny} | O tempo limite é de 30 dias.`,
            ephemeral: true
        })

    const msg = await Channel.send({ embeds: [{ color: color || client.blue, title: `${e.Loading} | Construindo sorteio...` }] }).catch(() => { })

    if (!msg?.id)
        return await interaction.reply({
            content: `${e.Deny} | Falha ao obter o ID da mensagem do sorteio. Verifique se eu realmente tenho permissão para enviar mensagem no canal de sorteios.`,
            ephemeral: true
        })

    await interaction.deferReply()

    const Message = await intChannel.send({ content: `${e.Loading} | Tudo certo! Última parte agora. Escolha um emoji **\`do Discord ou deste servidor\`** que você quer para o sorteio e **\`reaja nesta mensagem\`**. Caso queira o padrão, basta reagir em 🎉` })
    Message.react('🎉')

    const collector = Message.createReactionCollector({
        filter: (_, u) => u.id === user.id,
        idle: 20000
    })
        .on('collect', (reaction) => {

            const { emoji } = reaction

            if (emoji.id && !guild.emojis.cache.get(emoji.id))
                return Message.edit(`${e.Loading} | Tudo certo! Última parte agora. Escolha um emoji **\`do Discord ou deste servidor\`** que você quer para o sorteio e **\`reaja nesta mensagem\`**. Caso queira o padrão, basta reagir em 🎉\n \n${e.Deny} | Este emoji não pertence a este servidor. Por favor, escolha um emoji deste servidor ou do Discord.`)

            const emojiData = emoji.id || emoji.name

            collector.stop()
            return msg.react(emoji)
                .then(() => registerGiveaway(msg, emoji, emojiData, Message))
                .catch(err => {
                    Database.deleteGiveaway(msg.id, guild.id)
                    return intChannel.send(`${e.Warn} | Erro ao reagir no sorteio. | \`${err}\``)
                })
        })
        .on('end', (_, reason) => {
            if (reason === 'user') return

            return msg.react('🎉')
                .then(reaction => registerGiveaway(msg, reaction.emoji, emojiData, Message))
                .catch(err => {
                    Database.deleteGiveaway(msg.id, guild.id)
                    return intChannel.send(`${e.Warn} | Erro ao reagir no sorteio. | \`${err}\``)
                })
        })

    return

    async function registerGiveaway(msg, emoji = '🎉', emojiData = '🎉', Message) {

        const giveawayData = { // new Class Model
            MessageID: msg.id, // Id da Mensagem
            GuildId: guild.id, // Id do Servidor
            Prize: Prize, // Prêmio do sorteio
            Winners: WinnersAmount, // Quantos vencedores
            Emoji: emojiData, // Quantos vencedores
            TimeMs: TimeMs, // Tempo do Sorteio
            DateNow: Date.now(), // Agora
            ChannelId: Channel.id, // Id do Canal
            Actived: true, // Ativado
            MessageLink: msg.url, // Link da mensagem
            Sponsor: user.id, // Quem fez o sorteio
        }

        await Database.Guild.updateOne(
            { id: guild.id },
            { $push: { Giveaways: giveawayData } },
            { upsert: true }
        )

        await Database.Cache.Giveaways.push(
            `${client.shardId}.Giveaways.${guild.id}`,
            giveawayData
        )

        GiveawayManager.filterAndManager()

        const embed = {
            color: color || 0x0099ff,
            title: `${e.Tada} Sorteios ${guild.name}`,
            description: `Para entrar no sorteio, basta reagir no emoji ${emoji}`,
            fields: [
                {
                    name: `${e.Star} Prêmio`,
                    value: `> ${Prize}`,
                    inline: true
                },
                {
                    name: `${e.ModShield} Patrocinado por`,
                    value: `> ${user}`,
                    inline: true
                },
                {
                    name: `${e.CoroaDourada} Vencedores`,
                    value: `> ${parseInt(WinnersAmount)}`,
                    inline: true
                },
                {
                    name: '⏳ Término',
                    value: Date.GetTimeout(TimeMs, Date.now(), 'R'),
                    inline: true
                }
            ],
            image: { url: imageURL || null },
            footer: { text: `Giveaway ID: ${msg?.id}` }
        }

        if (Requisitos)
            embed.fields.push({
                name: `${e.Commands} Requisitos`,
                value: Requisitos
            })

        return msg.edit({ embeds: [embed] })
            .then(async () => {
                Message.delete()
                return await interaction.editReply({
                    content: `${e.Check} | Sorteio criado com sucesso! Você pode vê-lo no canal ${msg.channel}`,
                    ephemeral: true
                })
            })
            .catch(async err => {

                Database.deleteGiveaway(msg.id, guild.id)
                msg.delete()

                if (err.code === 50035)
                    return await interaction.followUp({
                        content: `⚠️ | Erro ao criar o sorteio.\nℹ | O link de imagem fornecido não é compátivel com as embeds do Discord.`,
                        ephemeral: true
                    })

                return await interaction.followUp({
                    content: `⚠️ | Erro ao criar o sorteio. | \`${err}\``,
                    ephemeral: true
                })
            })

    }

}