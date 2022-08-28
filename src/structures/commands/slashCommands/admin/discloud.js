import { ApplicationCommandOptionType } from 'discord.js'
import { logs, backup, user, restart, stop, start, update } from './functions/functions.discloud.js'

export default {
    name: 'discloud',
    description: '[admin] Comandos da Discloud Host',
    dm_permission: false,
    admin: true,
    type: 1,
    helpData: {
        description: 'Comando exclusivo aos meus administradores para obter informações e funções da minha HOST.'
    },
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
                {
                    name: 'Informação do Usuário',
                    value: 'user'
                },
                {
                    name: 'Reiniciar aplicação',
                    value: 'restart'
                },
                {
                    name: 'Parar aplicação',
                    value: 'stop'
                },
                {
                    name: 'Inicializar aplicação',
                    value: 'start'
                },
                {
                    name: 'Novo commit',
                    value: 'update'
                }
            ]
        }
    ],
    async execute({ interaction, e }) {

        const { options } = interaction
        const query = options.getString('options')

        switch (query) {
            case 'logs': logs(interaction); break;
            case 'backup': backup(interaction); break;
            case 'user': user(interaction); break;
            case 'restart': restart(interaction); break;
            case 'stop': stop(interaction); break;
            case 'start': start(interaction); break;
            case 'update': update(interaction); break;
            default:
                await interaction.reply({
                    content: `${e.Deny} | ID da OPTION não encontrado ou sem função definida.`,
                    ephemeral: true
                });
                break;
        }

        return

    }
}