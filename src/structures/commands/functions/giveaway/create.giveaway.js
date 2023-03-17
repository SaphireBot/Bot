import { Database, GiveawayManager, SaphireClient as client } from '../../../../classes/index.js'
import { Emojis as e } from '../../../../util/util.js'
import { Colors } from '../../../../util/Constants.js'
import { ButtonStyle } from 'discord.js'
import timeMs from '../../../../functions/plugins/timeMs.js'

export default async (interaction, giveawayResetedData, bySelectMenuInteraction) => {

    const { options, user, guild, channel: intChannel } = interaction
    const Prize = bySelectMenuInteraction ? giveawayResetedData?.Prize : options.getString('prize') || giveawayResetedData?.Prize
    const Time = bySelectMenuInteraction ? giveawayResetedData?.TimeMs : options.getString('time') || giveawayResetedData?.TimeMs
    const Requisitos = bySelectMenuInteraction ? giveawayResetedData?.Requires : options.getString('requires') || giveawayResetedData?.Requires
    const imageURL = bySelectMenuInteraction ? giveawayResetedData?.imageUrl : options.getString('imageurl') || giveawayResetedData?.imageUrl
    const Channel = bySelectMenuInteraction ? interaction.guild.channels.cache.get(giveawayResetedData?.ChannelId) : options.getChannel('channel') || interaction.guild.channels.cache.get(giveawayResetedData?.ChannelId)
    const color = bySelectMenuInteraction ? giveawayResetedData?.color : Colors[options.getString('color')] || giveawayResetedData?.color
    const WinnersAmount = bySelectMenuInteraction ? giveawayResetedData?.Winners || 1 : options.getInteger('winners') || giveawayResetedData?.Winners || 1
    let TimeMs = giveawayResetedData?.TimeMs || timeMs(Time)

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

    return await interaction.reply({
        content: `${e.Loading} | Tudo certo! Última parte agora. Escolha um emoji **\`do Discord ou deste servidor\`** que você quer para o sorteio e **\`reaja nesta mensagem\`**. Caso queira o padrão, basta reagir em 🎉`,
        fetchReply: true
    })
        .then(msg => {
            msg?.react('🎉')
                .then(() => collector(msg))
        })
        .catch(() => {
            msg.delete().catch(() => { })
            return interaction.channel.send({ content: `${e.DenyX} | Não foi possível obter a mensagem de origem.` })
        })

    async function collector(Message) {
        const collector = Message.createReactionCollector({
            filter: (_, u) => u.id === user.id,
            idle: 20000
        })
            .on('collect', (reaction) => {

                const { emoji } = reaction

                // if (emoji.id && !guild.emojis.cache.get(emoji.id))
                //     return Message.edit(`${e.Loading} | Tudo certo! Última parte agora. Escolha um emoji **\`do Discord ou deste servidor\`** que você quer para o sorteio e **\`reaja nesta mensagem\`**. Caso queira o padrão, basta reagir em 🎉\n \n${e.Deny} | Este emoji não pertence a este servidor. Por favor, escolha um emoji deste servidor ou do Discord.`)

                const emojiData = emoji.id || emoji.name
                collector.stop()
                return registerGiveaway(msg, emoji, emojiData, Message)
            })
            .on('end', (_, reason) => {
                if (reason == 'user') return
                if (reason == 'channelDelete') {
                    Database.deleteGiveaway(msg.id, interaction.guild.id)
                    msg.delete().catch(() => { })
                    if (msg?.channel)
                        return msg.channel.send({
                            content: `${e.SaphireWhat} | O canal inteiro onde o sorteio estava sendo montado, **SUMIU**${e.SaphireDesespero}. Só vim aqui dizer que o sorteio que estava sendo montado foi cancelado, ok?${e.cry}`
                        })
                }

                if (reason == 'messageDelete') {
                    Database.deleteGiveaway(msg.id, interaction.guild.id)
                    msg.delete().catch(() => { })
                    return interaction.channel.send({
                        content: `${e.cry} | A mensagem original foi deletada e eu nunca mais vou conseguir completar o sorteio.`
                    })
                }

                if (['time', 'idle'].includes(reason)) {
                    Database.deleteGiveaway(msg.id, interaction.guild.id)
                    Message.reactions.removeAll().catch(() => { })
                    return Message.edit({
                        content: `${e.cry} | O emoji não foi escolhido a tempo então eu cancelei o sorteio...`
                    }).catch(() => { })
                }

                return
            })
    }

    async function registerGiveaway(msg, emoji = '🎉', emojiData = '🎉', Message) {

        const giveawayData = { // new Class Model
            MessageID: msg.id, // Id da Mensagem
            GuildId: guild.id, // Id do Servidor
            Prize, // Prêmio do sorteio
            Winners: WinnersAmount, // Quantos vencedores
            Participants: [],
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
            description: `Para entrar no sorteio, basta clicar em \`Participar\``,
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

        return msg.edit({
            embeds: [embed],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Participar (0)',
                            emoji: emojiData,
                            custom_id: JSON.stringify({ c: 'giveaway', src: 'join' }),
                            style: ButtonStyle.Success
                        },
                        {
                            type: 2,
                            label: 'Dados & Participantes',
                            emoji: e.Commands,
                            custom_id: JSON.stringify({ c: 'giveaway', src: 'list' }),
                            style: ButtonStyle.Primary
                        }
                    ]
                }
            ]
        })
            .then(async () => {
                Message.reactions.removeAll().catch(() => { })
                return await Message.edit({
                    content: `${e.Check} | ${giveawayResetedData ? 'Sorteio resetado' : 'Sorteio criado'} com sucesso!`,
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    label: 'Sorteio',
                                    emoji: '🔗',
                                    url: msg.url,
                                    style: ButtonStyle.Link
                                },
                                {
                                    type: 2,
                                    label: 'Ok, deletar esta mensagem',
                                    emoji: e.Trash,
                                    custom_id: JSON.stringify({ c: 'delete' }),
                                    style: ButtonStyle.Danger
                                },
                            ]
                        }
                    ]
                }).catch(() => {
                    return interaction.channel.send({
                        content: `${e.Check} | Não consegui editar a mensagem original, então estou vindo aqui dizer que o sorteio foi criado com sucesso, ok?`,
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2,
                                        label: 'Sorteio',
                                        emoji: '🔗',
                                        url: msg.url,
                                        style: ButtonStyle.Link
                                    }
                                ]
                            }
                        ]
                    })
                })
            })
            .catch(async err => {

                Database.deleteGiveaway(msg.id, guild.id)
                msg.delete().catch(() => { })

                if (err.code === 50035)
                    return await Message.edit({
                        content: Message.content += `\n⚠️ | Erro ao criar o sorteio.\nℹ | O link de imagem fornecido não é compátivel com as embeds do Discord.`,
                    }).catch(() => { })

                return await Message.edit({
                    content:  Message.content += `\n⚠️ | Erro ao criar o sorteio. | \`${err}\``,
                }).catch(() => { })
            })

    }

}