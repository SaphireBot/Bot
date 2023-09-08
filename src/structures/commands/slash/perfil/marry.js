import { ApplicationCommandOptionType, ButtonStyle } from 'discord.js';
import { Database, SaphireClient as client } from '../../../../classes/index.js';
import { Emojis as e } from '../../../../util/util.js';

export default {
    name: 'marry',
    name_localizations: { 'pt-BR': 'casar' },
    description: '[perfil] Case com alguém especial',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'user',
            name_localizations: { 'pt-BR': 'usuário' },
            description: 'Usuário que você deseja se casar',
            type: ApplicationCommandOptionType.User,
            required: true
        }
    ],
    apiData: {
        name: "marry",
        description: "Case com alguém que você ama.",
        category: "Perfil",
        synonyms: ["casar"],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction }) {

        const { options, user } = interaction
        const member = options.getMember('user')

        await interaction.reply({ content: `${e.Loading} | Carregando os dados necessários...` })

        const usersData = await Database.getUsers([user.id, member?.id].filter(i => i))
        const userData = usersData.find(d => d.id == user.id)
        const memberData = usersData.find(d => d.id == member.id)

        if (member?.id == client.user.id)
            return interaction.editReply({
                content: `${e.Deny} | Foi mal, foi mal. Mas eu sou casada com o Itachi Uchiha 💝.`
            }).catch(() => { })

        if (member?.user?.bot)
            return interaction.editReply({
                content: `${e.Deny} | Não envolva meus amigos bots nesses atos mundanos...`
            }).catch(() => { })

        if (userData?.Perfil?.Marry?.Conjugate == member?.id)
            return interaction.editReply({
                content: `${e.Animated.SaphireQuestion} | Ué? Mas você já está em um relacionamento com ${member}... Não entendi...`
            })

        if (userData?.Perfil?.Marry?.Conjugate)
            return interaction.editReply({
                content: `${e.Animated.SaphireReading} | Nos meus registros, você já está em um relacionamento... Que coisa feia...`
            }).catch(() => { })

        if (!member)
            return interaction.editReply({
                content: `${e.DenyX} | Selecione um membro do servidor para efetuar o casamento oras bolas.`
            }).catch(() => { })

        if (memberData?.Perfil?.Marry?.Conjugate)
            return interaction.editReply({
                content: `${e.Animated.SaphireReading} | Eu verifiquei e ${member?.user?.username} já está em um relacionamento.`
            }).catch(() => { })

        if (
            (userData?.Balance || 0) < 50000
            || (memberData?.Balance || 0) < 50000
        )
            return interaction.editReply({
                content: `${e.Animated.SaphireReading} | Ambos tem que ter 50.000 Safiras para efetuar um casamento.`
            }).catch(() => { })

        return interaction.editReply({
            content: `${e.Loading} | ${member}, você aceita se casar com ${user}?\n${e.Animated.SaphireReading} | \`50.000 Safiras será descontado de ambos se o pedido for aceito\``,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Aceitar',
                            custom_id: JSON.stringify({ c: 'marry', src: 'accept', userId: user.id, memberId: member.id }),
                            emoji: '💍',
                            style: ButtonStyle.Success
                        },
                        {
                            type: 2,
                            label: 'Recusar',
                            emoji: '💔',
                            custom_id: JSON.stringify({ c: 'marry', src: 'deny', userId: user.id, memberId: member.id }),
                            style: ButtonStyle.Primary
                        }
                    ]
                }
            ]
        }).catch(() => { })
    }
}