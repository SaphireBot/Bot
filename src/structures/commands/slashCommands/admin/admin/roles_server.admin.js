import { ChatInputCommandInteraction } from "discord.js"
import { SaphireClient as client } from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    interaction.reply({ content: 'Ok.', ephemeral: true })

    return interaction.channel.send({
        embeds: [{
            color: client.blue,
            title: `${e.Notification} Cargos de Notificação`,
            description: 'Escolha os cargos e seja notificado de acordo a sua preferência.',
            fields: [
                {
                    name: '🔰 Cargos Disponíveis',
                    value: [
                        '996608615915982958',
                        '1090969268956438640',
                        '1090978161539436574',
                        '1090978503538782268'
                    ].map(roleId => `<@&${roleId}>`).join('\n')
                }
            ]
        }],
        components: [{
            type: 1,
            components: [{
                type: 3,
                custom_id: 'selectRoles',
                placeholder: 'Selecionar Cargos',
                max_values: 4,
                options: [
                    {
                        label: 'Anúncios',
                        emoji: '📣',
                        description: 'Seja notificado dos anúncios do servidor',
                        value: '996608615915982958',
                    },
                    {
                        label: 'Sorteios',
                        emoji: '🎉',
                        description: 'Seja notificado dos sorteios do servidor',
                        value: '1090969268956438640',
                    },
                    {
                        label: 'Saphire Updates',
                        emoji: '📝',
                        description: 'Seja notificado sobre os Updates da Saphire',
                        value: '1090978161539436574',
                    },
                    {
                        label: 'Saphire Status',
                        emoji: '📊',
                        description: 'Seja notificado sobre o status da Saphire',
                        value: '1090978503538782268',
                    },
                ]
            }]
        }]
    })

}