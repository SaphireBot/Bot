import { Colors } from '../../../../util/Constants.js'
import { ApplicationCommandOptionType } from 'discord.js'
import { CodeGenerator } from '../../../../functions/plugins/plugins.js'

export default {
    name: 'bitcoin',
    description: '[economy] Farme bitcoins e fique milhonário',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'lembrete',
            description: 'Ative um lembrete automático para você não se esquecer',
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'Ativar lembrete automático',
                    value: 'reminder'
                },
                {
                    name: 'Não quero lembrete automático',
                    value: 'no'
                }
            ]
        },
        {
            name: 'user',
            description: 'Veja a sequência de bitcoins de alguém',
            type: ApplicationCommandOptionType.User
        }
    ],
    helpData: {
        color: Colors.Gold,
        description: 'Quando você atingir 1000 Bitcoins você irá ficar milhonário',
        permissions: [],
        fields: []
    },
    async execute({ interaction, client, Database, emojis: e }) {

        const { options, user: author, guild } = interaction
        const user = options.getUser('user')
        const isReminder = options.getString('lembrete') === 'reminder'

        if (user) {

            const userData = await Database.User.findOne({ id: user?.id }, 'Perfil.Bitcoins Perfil.Bits')

            if (!userData)
                return await interaction.reply({
                    content: `${e.Database} | DATABASE | Nenhum usuário detectado.`,
                    ephemeral: true
                })

            const BitUserFarm = userData?.Perfil.Bits
            const BitUser = userData?.Perfil.Bitcoins || 0
            const avatar = user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 })

            return await interaction.reply({
                embeds: [{
                    color: Colors.Gold,
                    author: { name: user.username, iconURL: avatar },
                    fields: [
                        {
                            name: 'Bitcoins',
                            value: `${e.BitCoin} ${BitUser}`,
                            inline: true
                        },
                        {
                            name: 'BitFarm',
                            value: `${e.BitCoin} \`${BitUserFarm}/1000\``,
                            inline: true
                        }
                    ]
                }]
            })
        }

        const authorData = await Database.User.findOne({ id: author.id }, 'Perfil.Bits Perfil.Bitcoins Timeouts')
        const Bits = authorData?.Perfil?.Bits || 0
        const moeda = await guild.getCoin()
        const timeout = authorData?.Timeouts?.Bitcoin

        if (Date.Timeout(7200000, timeout))
            return await interaction.reply({
                content: `${e.Loading} | Seu farming está em \`${Bits}/1000\` e o reset é ${Date.Timestamp(((timeout || 0) - (timeout > 0 ? Date.now() : 0)) + 7200000, 'R')}`
            })

        return Bits >= 1000 ? NewBitCoin() : MineBitCoin()

        async function NewBitCoin() {

            await Database.User.updateOne(
                { id: author.id },
                {
                    $inc: {
                        'Perfil.Bits': -999,
                        'Perfil.Bitcoins': 1,
                        'Balance': 5000000
                    },
                    $push: {
                        Transactions: {
                            $each: [{
                                time: `${Date.format(0, true)}`,
                                data: `${e.gain} Recebeu 5000000 Safiras por ter adquirido um Bitcoin`
                            }],
                            $position: 0
                        }
                    }
                }
            )

            return await interaction.reply({
                content: `${e.Tada} | Você obteve **1 ${e.BitCoin} BitCoin**\n${e.PandaProfit} +5000000 ${moeda}`
            })
        }

        async function MineBitCoin() {

            await Database.User.updateOne(
                { id: author.id },
                {
                    $inc: { 'Perfil.Bits': 1 },
                    'Timeouts.Bitcoin': Date.now()
                },
                { upsert: true }
            )

            let returnContent = `${e.BitCoin} | Mais +1 fragmento de Bitcoin pra sua conta \`^${Bits + 1}/1000\`\n⏱ | Próximo reset ${Date.Timestamp(((timeout || 0) - (timeout > 0 ? Date.now() : 0)) + 7200000, 'R')}`

            if (isReminder) {
                new Database.Reminder({
                    id: CodeGenerator(7).toUpperCase(),
                    userId: author.id,
                    RemindMessage: 'Bitcoin Farming Disponível',
                    Time: 7200000,
                    DateNow: Date.now(),
                    isAutomatic: true,
                    ChannelId: interaction.channel.id
                }).save()
                returnContent += '\n⏰ | Lembrete automático ativado.'
            }

            return await interaction.reply({ content: returnContent })
        }
    }
}