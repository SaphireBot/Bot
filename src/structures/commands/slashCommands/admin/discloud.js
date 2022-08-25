import { ApplicationCommandOptionType } from 'discord.js'
import getLogs from './functions/logs.discloud.js'
import newBackup from './functions/backup.discloud.js'
import userInfo from './functions/user.discloud.js'
import restart from './functions/restart.discloud.js'
import { Colors } from '../../../../util/Constants.js'

export default {
    name: 'discloud',
    description: '[admin] Comandos da Discloud Host',
    dm_permission: false,
    admin: true,
    type: 1,
    options: [
        {
            name: 'options',
            description: 'Opções do comando',
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'Conteúdo do Terminal',
                    value: 'logs'
                },
                {
                    name: 'Fazer backup da aplicação na Host',
                    value: 'backup'
                },
                // {
                //     name: 'Informação do Usuário',
                //     value: 'user'
                // },
                {
                    name: 'Reiniciar aplicação',
                    value: 'restart'
                }
            ]
        }
    ],
    async execute({ interaction, emojis: e }) {

        const { options } = interaction
        const query = options.getString('options')

        if (query === 'logs') return getLogs(interaction)
        if (query === 'backup') return newBackup(interaction)
        if (query === 'user') return userInfo(interaction)
        if (query === 'restart') return restart(interaction)

    }
}