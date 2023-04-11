import { Colors } from '../../../../util/Constants.js'
import { ApplicationCommandOptionType } from 'discord.js'
import Daily from './daily/new.daily.js'

export default {
    name: 'daily',
    description: '[economy] Obtenha uma recompensa diária.',
    category: "economy",
    name_localizations: { "en-US": "daily", 'pt-BR': 'diário' },
    dm_permission: false,
    database: false,
    type: 1,
    options: [
        {
            name: 'options',
            description: 'Mais opções no sistema daily',
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'Meu status do daily',
                    value: 'sequency'
                },
                {
                    name: 'Ativar lembrete automático',
                    value: 'reminder'
                },
                {
                    name: 'Ativar lembrete automático no privado',
                    value: 'reminderPrivate'
                }
            ]
        }
    ],
    helpData: {
        color: Colors.Blue,
        description: 'Resgate recompensas diárias usando o daily'
    },
    execute: ({ interaction }) => new Daily(interaction).execute()
}