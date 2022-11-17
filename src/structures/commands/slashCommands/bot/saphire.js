import infoSaphire from "../../functions/bot/info.saphire.js"
import { ApplicationCommandOptionType } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"

export default {
    name: 'saphire',
    description: '[bot] Informações sobre a Saphire',
    category: "bot",
    dm_permission: false,
    type: 1,
    helpData: {
        description: 'Infos da Saphire'
    },
    options: [
        {
            name: 'images',
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
                        },
                        {
                            name: 'Fanarts',
                            value: 'fanarts'
                        }
                    ]
                }
            ]
        }
    ],
    async execute({ interaction }) {

        const { options } = interaction
        const isInfoCommand = options.getSubcommand() === "images"

        if (isInfoCommand)
            return infoSaphire(interaction)

        return await interaction.reply({
            content: `${e.Deny} | Comando não reconhecido... Estranho...`,
            ephemeral: true
        })

    }
}