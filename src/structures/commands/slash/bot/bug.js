import { ApplicationCommandOptionType } from 'discord.js'
import { Modals } from '../../../../classes/index.js'

export default {
    name: 'bug',
    description: '[bot] Report bugs aos meus administradores',
    category: "bot",
    dm_permission: false,
    database: false,
    type: 1,
    options: [
        {
            name: 'command',
            description: 'Comando que está bugado',
            type: ApplicationCommandOptionType.String,
            autocomplete: true
        }
    ],
    helpData: {
        description: 'Report bugs em comandos para meus administradores',
    },
    apiData: {
        name: "bug",
        description: "Reporte um erro que você achou na Saphire",
        category: "Saphire",
        synonyms: [],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, client }) {

        return await interaction
            .showModal(
                Modals
                    .reportBug(
                        client.slashCommands
                            .get(interaction.options.getString('command'))
                    )
            )
    }
}