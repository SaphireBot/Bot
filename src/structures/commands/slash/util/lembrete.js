import { ApplicationCommandOptionType } from 'discord.js'
import { CodeGenerator } from '../../../../functions/plugins/plugins.js'
import { Emojis as e } from '../../../../util/util.js'
import timeMs from '../../../../functions/plugins/timeMs.js'
import { socket } from '../../../../websocket/websocket.js'
import showReminder from '../../../../functions/update/reminder/src/show.reminder.js'

export default {
    name: 'reminder',
    description: '[util] Crie um lembrete e deixe que eu te aviso',
    dm_permission: false,
    database: false,
    name_localizations: { "en-US": "reminder", 'pt-BR': 'lembrete' },
    type: 1,
    options: [
        {
            name: 'criar',
            type: ApplicationCommandOptionType.Subcommand,
            description: '[util] Crie um novo lembrete',
            options: [
                {
                    name: 'mensagem',
                    description: 'Mensagem que eu devo te alertar',
                    type: ApplicationCommandOptionType.String,
                    min_length: 1,
                    max_length: 700,
                    required: true
                },
                {
                    name: 'quando',
                    description: 'Quando eu devo te avisar?',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'intervalo',
                    description: 'Intervalo em que o lembrete será desparado',
                    type: ApplicationCommandOptionType.Integer,
                    choices: [
                        {
                            name: 'Diariamente',
                            value: 1
                        },
                        {
                            name: 'Semanalmente',
                            value: 2
                        },
                        {
                            name: 'Mensal',
                            value: 3
                        }
                    ]
                }
            ]
        },
        {
            name: 'ver',
            type: ApplicationCommandOptionType.Subcommand,
            description: '[util] Veja os seus lembretes ativos',
            options: [
                {
                    name: 'itens',
                    type: ApplicationCommandOptionType.String,
                    description: 'Escolha um dos itens',
                    required: true,
                    autocomplete: true
                }
            ]
        }
    ],
    helpData: {
        title: '⏱️ Comando Lembrete',
        description: 'Ative um lembrete e eu vou te lembrar',
        fields: []
    },
    apiData: {
        name: "reminder",
        description: "Um poderoso sistema de lembrete. Me fale o que e o tempo e deixa o resto comigo.",
        category: "Utilidades",
        synonyms: ["lembrete"],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, client }) {

        const { options, user, channel, guild } = interaction
        const subCommand = options.getSubcommand()

        if (subCommand === 'ver')
            return showReminder(interaction, options.getString('itens'))

        const timeData = options.getString('quando')
        const message = options.getString('mensagem')
        const TimeMs = timeMs(timeData)

        if (!TimeMs)
            return interaction.reply({
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
                }],
                ephemeral: true
            })

        if (TimeMs > 63115200000)
            return interaction.reply({
                content: `${e.Deny} | O tempo limite é de 2 anos.`,
                ephemeral: true
            })

        const dateNow = Date.now()
        if ((dateNow + TimeMs) <= (dateNow + 4000))
            return interaction.reply({
                content: `${e.Deny} | O tempo mínimo para configurar um lembrete é de 5 segundos.`,
                ephemeral: true
            })

        const data = {
            id: CodeGenerator(5).toUpperCase(),
            userId: user.id,
            RemindMessage: message,
            guildId: guild.id,
            Time: TimeMs,
            timeout: false,
            snoozed: false,
            DateNow: dateNow,
            ChannelId: channel.id,
            interval: options.getInteger('intervalo') || 0
        }

        await interaction.reply({ content: `${e.Loading} | Salvando seu lembrete...`, ephemeral: true })

        const response = await socket
            ?.timeout(1000)
            .emitWithAck("postReminder", data)
            .catch(() => false)

        if (response === true)
            return interaction.editReply({
                content: `${e.Check} | Lembrete criado com sucesso! Vou te lembrar${message.length <= 250 ? ` de \`${message}\` ` : ' '}${data.Time > 86400000 ? `no dia ${Date.GetTimeout(data.Time + 1000, data.DateNow, 'F')} (${Date.GetTimeout(data.Time + 1000, data.DateNow, 'R')})` : Date.GetTimeout(data.Time + 1000, data.DateNow, 'R')}`,
            }).catch(() => { })

        if (response === false)
            return interaction.editReply({
                content: `${e.Animated.SaphireReading} | Algo de errado não está certo...`
            }).catch(() => { })

        if (response.includes("error"))
            return interaction.editReply({
                content: `${e.Animated.SaphirePanic} | HOOO MY GOSH!.\n${e.bug} | \`${response}\``
            }).catch(() => { })

        return interaction.editReply({
            content: `${e.QuestionMark} | Hum... Eu não recebi nenhuma resposta que era para eu ter recebido...`
        }).catch(() => { })

    }
}