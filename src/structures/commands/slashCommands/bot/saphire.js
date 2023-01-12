import infoSaphire from "../../functions/bot/info.saphire.js"
import { ApplicationCommandOptionType } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import fanartsSaphire from "../../functions/bot/fanarts.saphire.js"

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
            description: 'Informações gerais',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'options',
                    description: 'Opções de informações',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: 'Fotos de Perfil',
                            value: 'profile'
                        }
                    ]
                }
            ]
        },
        {
            name: 'fanarts',
            description: 'Comando em homenagem as fanarts',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'view',
                    description: 'Visualize as fanarts',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true
                }
            ]
        }
    ],
    async execute({ interaction }) {

        const { options } = interaction
        const subCommand = options.getSubcommand()

        if (subCommand === "info")
            return infoSaphire(interaction)

        if (subCommand === "fanarts")
            return fanartsSaphire(interaction)

        return await interaction.reply({
            content: `${e.Deny} | Comando não reconhecido... Estranho...`,
            ephemeral: true
        })

    }
}