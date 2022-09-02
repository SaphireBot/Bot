import { Emojis as e } from '../../../../util/util.js'
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
            description: 'Verifique o status do seu daily',
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'Meu status do daily',
                    value: 'sequency'
                }
            ]
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