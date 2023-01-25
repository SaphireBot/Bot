import { SaphireClient as client } from '../../../../../../classes/index.js'
import { ButtonStyle } from "discord.js"
import { Emojis as e } from "../../../../../../util/util.js"

export default async interaction => {

    const { options } = interaction
    const image = options.getAttachment('image')
    const name = options.getString('name')
    const anime = options.getString('anime')
    const type = options.getString('type')

    if (!['image/png', 'image/gif', 'image/jpeg', 'image/jpg'].includes(image.contentType))
        return await interaction.reply({
            content: `${e.Deny} | Apenas imagens no formato \`.png\`, \`jpg\`, \`.jpeg\`, \`.gif\` são suportados.`,
            ephemeral: true
        })

    if (client.animes.find(an => an.name?.toLowerCase() === name.toLowerCase()))
        return await interaction.reply({
            content: `${e.Deny} | Este anime já foi registrado no banco de dados.`,
            components: [], embeds: []
        }).catch(() => { })

    if (client.animes.filter(an => an.type === 'anime').find(an => an.name?.toLowerCase() === name.toLowerCase()))
        return await interaction.reply({
            content: `${e.Deny} | Este anime já foi registrado no banco de dados.`,
            components: [], embeds: []
        }).catch(() => { })

    const elementType = [
        {
            name: 'Anime',
            value: 'anime'
        },
        {
            name: 'Personagem Masculino',
            value: 'male'
        },
        {
            name: 'Personagem Feminino',
            value: 'female'
        },
        {
            name: 'Outros',
            value: 'others'
        }
    ].find(elem => elem.value === type)

    return await interaction.reply({
        embeds: [{
            color: client.blue,
            title: `${e.QuestionMark} ${client.user.username}'s Anime Quiz Indication`,
            description: 'Confira os dados abaixo e confirme sua indicação',
            fields: [
                {
                    name: '📝 Nome do Personagem/Anime',
                    value: name
                },
                {
                    name: '📺 Nome do Anime',
                    value: anime
                },
                {
                    name: '🔍 Tipo do Elemento',
                    value: elementType.name
                }
            ],
            image: {
                url: image.attachment
            }
        }],
        components: [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Confirmar e Enviar',
                    custom_id: JSON.stringify({ c: 'animeQuiz' }),
                    style: ButtonStyle.Success
                },
                {
                    type: 2,
                    label: 'Cancelar Envio',
                    custom_id: JSON.stringify({ c: 'delete' }),
                    style: ButtonStyle.Danger
                }
            ]
        }]
    })
}