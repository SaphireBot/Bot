import { ApplicationCommandOptionType } from 'discord.js'
import { Modals } from '../../../../classes/index.js'

export default {
    name: 'bug',
    description: '[bot] Report bugs aos meus administradores',
    category: "bot",
    dm_permission: false,
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
    async execute({ interaction, client }) {

        const { options } = interaction
        const commandQuery = options.getString('command')
        const command = client.slashCommands.get(commandQuery)
        return await interaction.showModal(Modals.reportBug(command))
    }
}