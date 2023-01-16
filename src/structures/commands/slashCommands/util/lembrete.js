import { ApplicationCommandOptionType } from 'discord.js'
import { CodeGenerator } from '../../../../functions/plugins/plugins.js'
import { Emojis as e } from '../../../../util/util.js'
import timeMs from '../../../../functions/plugins/timeMs.js'
import managerReminder from '../../../../functions/update/reminder/manager.reminder.js'
import reminderStart from '../../../../functions/update/reminder/src/start.reminder.js'

export default {
    name: 'lembrete',
    description: '[util] Crie um lembrete e deixe que eu te aviso',
    dm_permission: false,
    database: false,
    type: 1,
    options: [
        {
            name: 'criar',
            type: ApplicationCommandOptionType.Subcommand,
            description: '[util] Crie um novo lembrete',
            options: [
                {
                    name: 'quando',
                    description: 'Quando eu devo te avisar?',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'mensagem',
                    description: 'Mensagem que eu devo te alertar',
                    type: ApplicationCommandOptionType.String,
                    min_length: 1,
                    max_length: 1024,
                    required: true
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
    async execute({ interaction, client }) {

        const { options, user, channel, guild } = interaction
        const subCommand = options.getSubcommand()

        if (subCommand === 'ver')
            return await managerReminder.show(interaction, options.getString('itens'))

        const timeData = options.getString('quando')
        const message = options.getString('mensagem')
        const TimeMs = timeMs(timeData)

        if (!TimeMs)
            return await interaction.reply({
                embeds: [{
                    color: client.blue,
                    title: `⏱️ | ${client.user.username}'s Time System`,
                    description: 'O meu sistema de tempo transforma o que você escreve em uma data.',
                    fields: [
                        {
                            name: '📝 Formas de Escrita',
                            value: "> \`h - m - s\` - Hora, Minuto, Segundo\n> \`1h 10m 40s\` - \`1m 10s\` - \`2h 10m\`\n> \`2 dias 10 minutos 5 segundos\`\n> \`30/01/2022 14:35:25\` *Os segundos são opcionais*\n> \`hoje 14:35` - `amanhã 14:35\`\n> \`09:10\` - \`14:35\` - \`30/01/2022\` - \`00:00\`"
                        }
                    ]
                }]
            })

        const data = {
            id: CodeGenerator(7).toUpperCase(),
            userId: user.id,
            RemindMessage: message,
            guildId: guild.id,
            Time: TimeMs,
            DateNow: Date.now(),
            ChannelId: channel.id
        }

        return managerReminder.save(data)
            .then(async doc => {
                setTimeout(() => reminderStart({ user, data }), TimeMs)
                return await interaction.reply({
                    content: `${e.Check} | Lembrete criado com sucesso! Vou te lembrar${message.length <= 250 ? ` de \`${message}\` ` : ' '}${doc.Time > 86400000 ? Date.GetTimeout(doc.Time, doc.DateNow, 'f') : Date.GetTimeout(doc.Time, doc.DateNow, 'R')}`,
                    ephemeral: true
                })
            })
            .catch(async err => await interaction.reply({
                content: `${e.cry} | Não foi possível criar o sorteio.\n${e.bug} | \`${err}\``
            }))

    }
}