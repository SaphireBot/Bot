import {
    SaphireClient as client,
    Database
} from '../../../../../classes/index.js'
import { Emojis as e } from '../../../../../util/util.js'
import fs from 'fs'

export default async interaction => {

    const { options } = interaction
    const answers = options.getString('marca')
    const imageURLNoCensor = options.getString('image_url_sem_censura')
    const imageURLWithCensor = options.getString('image_url_com_censura') || null
    const synonym = options.getString('sinonimo')
    const synonym2 = options.getString('outro_sinonimo')
    const logoData = Database.Logomarca || []

    if (imageURLNoCensor === imageURLWithCensor)
        return await interaction.reply({
            content: `${e.Deny} | Os links são iguais.`,
            ephemeral: true
        })

    if ([synonym?.toLowerCase(), synonym2?.toLowerCase()].includes(answers?.toLowerCase()))
        return await interaction.reply({
            content: `${e.Deny} | O nome é igual a um dos sinônimos.`,
            ephemeral: true
        })

    for (let logo of logoData) {
        if (logo?.answers?.find(logoName => [answers.toLowerCase(), synonym?.toLowerCase(), synonym2?.toLowerCase()].includes(logoName?.toLowerCase())))
            return await interaction.reply({
                content: `${e.Deny} | Este nome ou sinônimo de logo/marca já existe no banco de dados.`,
                ephemeral: true
            })

        if (logo?.images.censored && [imageURLNoCensor, imageURLWithCensor].includes(logo?.images.censored) || logo?.images.uncensored && [imageURLNoCensor, imageURLWithCensor].includes(logo.images.uncensored))
            return await interaction.reply({
                content: `${e.Deny} | Esta imagem já foi registada.`,
                ephemeral: true
            })

        if (!imageURLNoCensor.isURL())
            return await interaction.reply({
                content: `${e.Deny} | Este não é um link válido.`,
                ephemeral: true
            })

        if (!imageURLNoCensor.includes('https://cdn.discordapp.com/attachments/') && !imageURLNoCensor.includes('https://media.discordapp.net/attachments/'))
            return await interaction.reply({
                content: `${e.Deny} | Este não é um link válido.`,
                ephemeral: true
            })

        if (imageURLWithCensor && !imageURLWithCensor.includes('https://cdn.discordapp.com/attachments/') && !imageURLWithCensor.includes('https://media.discordapp.net/attachments/'))
            return await interaction.reply({
                content: `${e.Deny} | Este não é um link válido.`,
                ephemeral: true
            })

    }

    const saveData = {
        answers: [answers.toLowerCase()],
        images: {
            censored: imageURLWithCensor,
            uncensored: imageURLNoCensor
        }
    }

    if (synonym) saveData.answers.push(synonym?.toLowerCase())
    if (synonym2) saveData.answers.push(synonym2?.toLowerCase())

    const dataToSave = [...Database.Logomarca, saveData]

    fs.writeFile(
        './JSON/logomarca.json',
        JSON.stringify(dataToSave, null, 4),
        async function (err) {

            if (err)
                return await interaction.reply({
                    content: `${e.Deny} | Não foi possível salvar essa logomarca.`,
                    ephemeral: true
                })

            return await interaction.reply({
                embeds: [
                    {
                        color: client.green,
                        title: `${e.Check} | Nova logo/marca registrada`,
                        description: `A logo/marca **${answers}** foi registrada com sucesso!`,
                        image: { url: imageURLNoCensor },
                        fields: [
                            {
                                name: 'Sinônimos',
                                value: [synonym, synonym2].filter(x => x).map(x => `\`${x}\``).join(', ') || 'Nenhum sinônimo foi dado'
                            },
                            {
                                name: 'Imagem Censurada',
                                value: imageURLWithCensor ? 'Sim' : 'Não'
                            }
                        ]
                    }
                ],
                ephemeral: true
            })
        }
    )
}