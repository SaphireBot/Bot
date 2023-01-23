import { Database, SaphireClient as client } from '../../../../../../classes/index.js'
import { ButtonStyle } from "discord.js"
import { Emojis as e } from "../../../../../../util/util.js"

export default async (interaction, suggestId) => {

    const { user } = interaction
    const value = suggestId || interaction.options.getString('method')
    return value === 'view' ? view() : analize()

    async function view() {

        const availableAnimes = client.animes.filter(an => an?.sendedFor == user.id)

        if (!availableAnimes || !availableAnimes.length)
            return await interaction.reply({
                content: `${e.Deny} | Você não tem nenhum anime aprovado.`,
                ephemeral: true
            })

        return await interaction.reply({
            content: `${e.Check} | Você tem exatamente ${availableAnimes.length || 0} animes aprovados. Em breve, terá uma página bonitinha para você ver tudo certinho.`
        })
    }

    async function analize() {

        if (!client.staff.includes(user.id) && user.id !== '516048524388073516')
            return await interaction.reply({
                content: `${e.Deny} | Apenas membros da Staff tem poder para analizar indicações de animes.`,
                ephemeral: true
            })

        const clientData = await Database.Client.findOne({ id: client.user.id }, 'AnimeQuizIndication')
        const animes = clientData?.AnimeQuizIndication || []

        if (!animes || !animes.length) {
            await interaction.update({ components: [] })
            return interaction.channel.send({
                content: `${e.Deny} | Nenhuma indicação de anime disponível no momento.`
            })
        }

        const anime = animes[Math.floor(Math.random() * animes.length)]

        if (!anime)
            return await interaction.reply({
                content: `${e.Deny} | Nenhum anime encontrado.`
            })

        const sendedFor = await client.users.fetch(anime.sendedFor || "0")
            .then(u => `${u.tag} - \`${u.id}\``)
            .catch(() => `Not Found - \`${anime.sendedFor}\``)

        return await interaction.reply({
            embeds: [{
                color: client.blue,
                title: `${e.QuestionMark} ${client.user.username}'s Anime Quiz Indication | Analize Session`,
                description: 'Confira os dados do anime abaixo e confirme sua analize',
                fields: [
                    {
                        name: '🆔 Database Anime ID',
                        value: anime.id
                    },
                    {
                        name: '📝 Nome do Personagem/Anime',
                        value: anime.name
                    },
                    {
                        name: '📺 Nome do Anime',
                        value: anime.anime
                    },
                    {
                        name: '🔍 Tipo do Elemento',
                        value: anime.type
                    },
                    {
                        name: '👤 Enviado por',
                        value: sendedFor
                    }
                ],
                image: {
                    url: anime.imageUrl
                }
            }],
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Aceitar',
                        custom_id: JSON.stringify({ c: 'animeQuiz', src: 'accept', sendedFor: anime.sendedFor }),
                        style: ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: 'Excluir',
                        custom_id: JSON.stringify({ c: 'animeQuiz', src: 'delete', sendedFor: anime.sendedFor }),
                        style: ButtonStyle.Danger
                    },
                    {
                        type: 2,
                        label: 'Editar',
                        custom_id: JSON.stringify({ c: 'animeQuiz', src: 'edit' }),
                        style: ButtonStyle.Secondary
                    },
                ]
            }]
        })
    }
}