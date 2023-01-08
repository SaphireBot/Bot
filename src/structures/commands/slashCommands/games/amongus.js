import { Emojis as e } from '../../../../util/util.js'
import { DiscordPermissons, PermissionsTranslate } from '../../../../util/Constants.js'
import { ApplicationCommandOptionType, ButtonStyle } from 'discord.js'
import { CodeGenerator } from '../../../../functions/plugins/plugins.js'
import { Database } from '../../../../classes/index.js'

export default {
    name: 'amongus',
    description: '[game] Inicie uma partida de Among Us! Eu ajudo.',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'invite',
            description: 'Convite da partida',
            max_length: 6,
            min_length: 6,
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    helpData: {
        color: '',
        description: 'Um comando para jogar com among us com os amigos',
        permissions: [],
        fields: []
    },
    async execute({ interaction, client }) {

        const { guild, member, user, options } = interaction

        if (!guild.members.me.permissions.has(DiscordPermissons.MuteMembers, true)
            || !guild.members.me.permissions.has(DiscordPermissons.ManageChannels, true))
            return await interaction.reply({
                content: `${e.Deny} | Eu preciso da permissão **${PermissionsTranslate.MuteMembers} e ${PermissionsTranslate.ManageChannels}** para executar este comando.`
            })

        const { channel } = member.voice

        if (!channel)
            return await interaction.reply({
                content: `${e.Deny} | Você não está em nenhum canal de voz.`,
                ephemeral: true
            })

        const invite = options.getString('invite')

        const membersAllowed = channel.members
        membersAllowed.sweep(member => member.bot)

        if (!membersAllowed || membersAllowed.size < 4)
            return await interaction.reply({
                content: `${e.Deny} | Tem que ter ao menos 4 participantes no canal de voz (${channel}) para iniciar uma partida de Among Us.`
            })

        const partyId = CodeGenerator(7)

        await Database.Cache.AmongUs.set(partyId, {
            host: user.id,
            channelId: channel.id,
            invite,
            players: [],
            deaths: [],
            inMute: [],
        })

        return await interaction.reply({
            embeds: [{
                color: client.blue,
                title: `${e.amongus} | Among Us Party | Starting`,
                description: 'Este é um comando técnico feito para ajudar os jogadores em partidas do jogo Among Us. Auxiliando nos mutes de um jeito fácil.',
                fields: [
                    {
                        name: '👥 Jogadores',
                        value: `${membersAllowed.map(m => `${e.Loading} | ${m}`).join('\n')}`.limit('MessageEmbedFieldValue')
                    },
                    {
                        name: '👻 Mortos',
                        value: 'Ninguém morreu ainda'
                    },
                    {
                        name: `${e.Info} Status`,
                        value: `Esperando confirmação de pelo menos 4 jogadores.`
                    }
                ],
                footer: {
                    text: `Party: ${partyId}`
                }
            }],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Participar',
                            custom_id: JSON.stringify({ c: 'amongus', src: 'join', partyId }),
                            style: ButtonStyle.Success
                        },
                        {
                            type: 2,
                            label: 'Sair',
                            custom_id: JSON.stringify({ c: 'amongus', src: 'leave', partyId }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Cancelar',
                            custom_id: JSON.stringify({ c: 'amongus', src: 'cancel', partyId }),
                            style: ButtonStyle.Danger
                        },
                        {
                            type: 2,
                            label: 'Copiar código',
                            custom_id: JSON.stringify({ c: 'amongus', src: 'copy', partyId }),
                            style: ButtonStyle.Secondary
                        }
                    ]
                }
            ]
        })

    }
}