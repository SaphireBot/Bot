import fanarts from "../../functions/bot/fanarts.saphire.js"
import profile from "../../functions/bot/profile.saphire.js"
import { ApplicationCommandOptionType } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"

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
            name_localizations: { "en-US": "informations", 'pt-BR': 'informações' },
            description: 'Informações Gerais',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'Dados Técnico (Bot Info)',
                    value: 'data'
                },
                {
                    name: 'Ver as Fotos de Perfil',
                    value: 'fanarts'
                }
            ]
        }
    ],
    async execute({ interaction }) {

        const subCommand = { profile, fanarts }[interaction.options.getString('info')]

        if (!subCommand)
            return await interaction.reply({
                content: '${e.Deny} | Comando não reconhecido... ${ReplayNonSubFunctionFound_151844}',
                ephemeral: true
            })

        return subCommand(interaction)
    }
}