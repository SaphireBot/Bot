import { Emojis as e } from '../../../../util/util.js'
import { ApplicationCommandOptionType, ButtonStyle } from 'discord.js'

export default {
    name: 'connect4',
    description: '[games] Um simples connect4',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'adversário',
            type: ApplicationCommandOptionType.User,
            description: 'Escolher o seu adversário',
            required: true
        }
    ],
    helpData: {},
    async execute({ interaction }) {
        // return interaction.reply({ content: `${e.Loading} | Em Breve.`, ephemeral: true })
        const member = interaction.options.getMember('adversário')

        if (!member)
            return await interaction.reply({
                content: `${e.Deny} | Opa opa, selecione um membro do servidor, ok? ||Que não seja um bot, ok?||`,
                ephemeral: true
            })

        if (member.user.bot)
            return await interaction.reply({
                content: `${e.Deny} | Opa opa, selecione um membro do servidor, ok? ||Que não seja um bot, ok?||`,
                ephemeral: true
            })

        if (member.user.id == interaction.user.id)
            return interaction.reply({
                content: `${e.Deny} | Opa opa, nada de jogar contra você mesmo.`,
                ephemeral: true
            })

        return await interaction.reply({
            content: `${e.Loading} | ${member}, você esta sendo desafiado por ${interaction.user} para uma partida de Connect4.`,
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Aceitar',
                        emoji: '🟡',
                        custom_id: JSON.stringify({ c: 'connect', src: 'init', userId: member.id }),
                        style: ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: 'Recusar',
                        emoji: '🔴',
                        custom_id: JSON.stringify({ c: 'connect', src: 'cancel', userId: member.id }),
                        style: ButtonStyle.Danger
                    },
                ]
            }]
        })
    }
}