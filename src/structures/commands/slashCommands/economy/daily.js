import { Colors } from '../../../../util/Constants.js'
import { ApplicationCommandOptionType } from 'discord.js'
import Daily from './daily/new.daily.js'

export default {
    name: 'daily',
    description: '[economy] Obtenha uma recompensa diária.',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'options',
            description: 'Mais opções no sistema daily',
            type: ApplicationCommandOptionType.String,
            autocomplete: true
        }
    ],
    helpData: {
        color: Colors.Blue,
        description: 'Resgate recompensas diárias usando o daily'
    },
    async execute({ interaction }) {
        return new Daily(interaction).execute()
    }
}