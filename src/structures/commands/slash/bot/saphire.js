import { ApplicationCommandOptionType } from "discord.js"
import fanarts from "../../functions/bot/fanarts.saphire.js"
import profile from "../../functions/bot/profile.saphire.js"
import botinfo from "../../functions/bot/botinfo.saphire.js"
import commands from "../../functions/bot/commands.saphire.js"
import history from "../../functions/bot/commandHistory.saphire.js"

export default {
    name: 'saphire',
    description: '[bot] Informações sobre a Saphire',
    category: "bot",
    dm_permission: false,
    database: false,
    type: 1,
    helpData: {
        description: 'Infos da Saphire'
    },
    options: [
        {
            name: 'info',
            name_localizations: { 'pt-BR': 'informações' },
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Informações Gerais',
            options: [
                {
                    name: 'info',
                    name_localizations: { 'pt-BR': 'informações' },
                    type: ApplicationCommandOptionType.String,
                    description: 'Informações Gerais',
                    required: true,
                    choices: [
                        {
                            name: 'Dados Técnico (Bot Info)',
                            value: 'botinfo'
                        },
                        {
                            name: 'Ver Fanarts',
                            value: 'fanarts'
                        },
                        {
                            name: 'Comandos Usados',
                            value: 'commands'
                        }
                    ]
                }
            ]
        },
        {
            name: 'commands_control',
            name_localizations: { 'pt-BR': 'comandos' },
            description: 'Histórico dos comandos usados',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'command',
                    name_localizations: { 'pt-BR': 'comando' },
                    type: ApplicationCommandOptionType.String,
                    description: 'Selecione um comando para ver seu histórico de uso',
                    autocomplete: true
                },
                {
                    name: 'server',
                    type: ApplicationCommandOptionType.String,
                    description: 'Selecione um servidor para ver o hitórico do comando neste servidor',
                    autocomplete: true
                },
                {
                    name: 'user',
                    type: ApplicationCommandOptionType.User,
                    description: 'Selecione um usuário para ver o hitórico do comando usado por ele',
                    autocomplete: true
                }
            ]
        }
    ],
    apiData: {
        name: "saphire",
        description: "Um resumo de informações da Saphire em um só comando",
        category: "Saphire",
        synonyms: [],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    execute({ interaction }) {

        const subCommand = interaction.options.getSubcommand()

        if (subCommand == 'info') {
            const subCommand = { profile, fanarts, botinfo, commands }[interaction.options.getString('info')]
            if (subCommand) return subCommand(interaction)
        }

        if (subCommand == 'commands_control') return history(interaction)

        return interaction.reply({
            content: '${e.Deny} | Comando não reconhecido... ${ReplayNonSubFunctionFound_151844}',
            ephemeral: true
        })

    }
}