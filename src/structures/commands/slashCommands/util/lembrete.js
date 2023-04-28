import { ApplicationCommandOptionType } from 'discord.js'
import { CodeGenerator } from '../../../../functions/plugins/plugins.js'
import { Emojis as e } from '../../../../util/util.js'
import timeMs from '../../../../functions/plugins/timeMs.js'
import managerReminder from '../../../../functions/update/reminder/manager.reminder.js'

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
            return await interaction.reply({
                content: `${e.Deny} | O tempo limite é de 2 anos.`,
                ephemeral: true
            })

        if ((Date.now() + TimeMs) <= (Date.now() + 4000))
            return await interaction.reply({
                content: `${e.Deny} | O tempo minímo para configurar um lembrete é de 5 segundos.`,
                ephemeral: true
            })

        const data = {
            id: CodeGenerator(7).toUpperCase(),
            userId: user.id,
            RemindMessage: message,
            guildId: guild.id,
            Time: TimeMs,
            timeout: false,
            snoozed: false,
            DateNow: Date.now(),
            ChannelId: channel.id
        }

        return managerReminder.save(user, data)
            .then(async () => await interaction.reply({
                content: `${e.Check} | Lembrete criado com sucesso! Vou te lembrar${message.length <= 250 ? ` de \`${message}\` ` : ' '}${data.Time > 86400000 ? `no dia ${Date.GetTimeout(data.Time + 1000, data.DateNow, 'F')} (${Date.GetTimeout(data.Time + 1000, data.DateNow, 'R')})` : Date.GetTimeout(data.Time + 1000, data.DateNow, 'R')}`,
                ephemeral: true
            }))
            .catch(async err => await interaction.reply({
                content: `${e.SaphireChorando} | Não foi possível criar o lembrete.\n${e.bug} | \`${err}\``
            }))

    }
}