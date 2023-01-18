import { Database, GiveawayManager, SaphireClient as client } from '../../../../classes/index.js'
import { Emojis as e } from '../../../../util/util.js'
import { Colors } from '../../../../util/Constants.js'
import timeMs from '../../../../functions/plugins/timeMs.js'

export default async interaction => {

    const { options, user, guild, channel: intChannel } = interaction
    const Prize = options.getString('prize')
    const Time = options.getString('time')
    const Requisitos = options.getString('requires')
    const imageURL = options.getString('imageurl')
    const Channel = options.getChannel('channel')
    const color = Colors[options.getString('color')]
    const WinnersAmount = options.getInteger('winners') || 1
    let TimeMs = timeMs(Time)

    if (!TimeMs)
        return await interaction.reply({
            embeds: [{
                color: client.blue,
                title: `⏱️ | ${client.user.username}'s Time System`,
                description: 'O meu sistema de tempo transforma o que você escreve em uma data.\nEle suporta 7 tipos diferentes de tempo escrito.',
                fields: [
                    {
                        name: '📝 Formas de Escrita',
                        value: "> \`a - h - m - s\` - Ano, Hora, Minuto, Segundo\n \n> \`1h 10m 40s\` - \`1m 10s\` - \`2h 10m\`\n \n> \`2 dias 10 minutos 5 segundos\`\n \n> \`30/01/2022 14:35:25\` *Os segundos são opcionais*\n \n> \`hoje 14:35` - `amanhã 14:35\`\n \n> \`09:10\` - \`14:35\` - \`30/01/2022\` - \`00:00\`\n \n> `domingo 11:00` - `segunda` - `terça-feira 17:00`"
                    },
                    {
                        name: `${e.QuestionMark} Status`,
                        value: TimeMs === false ? 'O tempo definido não pode estar no passado' : 'Tempo definido de forma incorreta'
                    }
                ]
            }]
        })

    if ((Date.now() + TimeMs) <= (Date.now() + 4000))
        return await interaction.reply({
            content: `${e.Deny} | O tempo minímo para configurar um sorteio é de 5 segundos.`,
            ephemeral: true
        })

    if (TimeMs > 63115200000)
        return await interaction.reply({
            content: `${e.Deny} | O tempo limite é de 2 anos.`,
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
                .then(() => registerGiveaway(msg, null, null, Message))
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

        GiveawayManager.selectGiveaways([giveawayData])

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