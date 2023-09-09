import { Database, SaphireClient as client } from '../../../../classes/index.js';
import { ButtonStyle } from 'discord.js';
import { Emojis as e } from '../../../../util/util.js';

export default {
    name: 'divorce',
    name_localizations: { 'pt-BR': 'divórcio' },
    description: '[perfil] Coloque um fim no seu relacionamento.',
    dm_permission: false,
    type: 1,
    options: [],
    api_data: {
        name: "divorce",
        description: "O fim do casamento é muito ruim... (As vezes)",
        category: "Perfil",
        synonyms: ["divórcio"],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction }) {

        const { user } = interaction
        await interaction.reply({ content: `${e.Loading} | Carregando seus dados...` })

        const userData = await Database.getUser(user.id)

        if (!userData?.Perfil?.Marry?.Conjugate)
            return interaction.editReply({
                content: `${e.Animated.SaphireCry} | Você não está em um relacionamento com ninguém para efetuar o divórcio.`
            }).catch(() => { })

        if ((userData?.Balance || 0) < 100000)
            return interaction.editReply({
                content: `${e.Deny} | Você precisa de 100.000 Safiras para efetuar o divórcio.`
            }).catch(() => { })

        const conjuge = await client.users.fetch(userData?.Perfil?.Marry?.Conjugate).catch(() => null)
        if (!conjuge) return nullishConjugate()

        return interaction.editReply({
            content: `${e.QuestionMark} | Você tem certeza que deseja se divorciar de ${conjuge.username}? Vocês estão juntos à ${Date.Timestamp(new Date(userData?.Perfil?.Marry?.StartAt), 'R', true)}\n${e.Animated.SaphireReading} | Isso lhe custará 100.000 Safiras.`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Divorciar',
                            custom_id: JSON.stringify({ c: 'marry', src: 'divorce' }),
                            style: ButtonStyle.Danger
                        },
                        {
                            type: 2,
                            label: 'Cancelar Divórcio',
                            custom_id: JSON.stringify({ c: 'delete' }),
                            style: ButtonStyle.Success
                        }
                    ]
                }
            ]
        }).catch(() => { })

        async function nullishConjugate() {

            await interaction.editReply({ content: `${e.Loading} | Cônjuge não encontrado... Efetuando divórcio sem custos a ambas as partes...` }).catch(() => { })

            await Database.User.findOneAndUpdate(
                { id: user.id },
                { $unset: { "Perfil.Marry": true } },
                { new: true, upsert: true }
            )
                .then(doc => Database.saveUserCache(doc?.id, doc))

            await Database.User.findOneAndUpdate(
                { id: userData?.Perfil?.Marry?.Conjugate },
                { $unset: { "Perfil.Marry": true } },
                { new: true, upsert: true }
            )
                .then(doc => Database.saveUserCache(doc?.id, doc))

            return interaction.editReply({ content: `${e.Animated.SaphireReading} | Eu busquei seus dados e o seu cônjuge não está disponível nos meus sistemas. Efetuei o divórcio sem custos.` }).catch(() => { })
        }

    }
}