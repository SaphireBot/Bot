import axios from 'axios'
import { Emojis as e } from '../../../../util/util.js'

export default async (interaction, animeName) => {

    await interaction.reply({ content: `${e.Loading} | Pesquisando animes com nomes parecidos...`, ephemeral: animeName ? true : false })

    const { options } = interaction
    const search = options?.getString('input') || animeName
    const lookingFor = options?.getString('in') || 'anime'

    if (!['anime', 'manga'].includes(lookingFor))
        return await interaction.reply({
            content: `${e.Deny} | Parâmetro de busca incorreto.`,
            ephemeral: true
        })

    return axios({
        baseURL: `https://kitsu.io/api/edge/${lookingFor}?filter[text]=${search
            .replace(/[ãâáàä]/gi, 'a')
            .replace(/[êéèë]/gi, 'e')
            .replace(/[îíìï]/gi, 'i')
            .replace(/[õôóòö]/gi, 'o')
            .replace(/[ûúùü]/gi, 'u')
            .replace(/[ç]/gi, 'c')
            }`,
        headers: {
            Accept: 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
        }
    })
        .then(async result => {

            const animes = result?.data?.data || []

            if (!animes || !animes?.length)
                return await interaction.editReply({
                    content: `${e.Deny} | Nenhum resultado obtido para a sua busca.`
                }).catch(() => { })

            const selectMenu = selectMenuGenerator(animes)

            return await interaction.editReply({
                content: `${e.Loading} | Escolha um dos animes que eu encontrei.`,
                components: [selectMenu]
            })

        })
        .catch(async err => {
            console.log(err)
            return await interaction.editReply({
                content: `${e.Deny} | Anime não encontrado.`
            }).catch(() => { })
        })

    function selectMenuGenerator(animes) {

        const selectMenuObject = {
            type: 1,
            components: [{
                type: 3,
                custom_id: lookingFor === 'anime' ? 'animeChoosen' : 'mangaChoosen',
                placeholder: 'Selecione um anime',
                options: []
            }]
        }

        const values = []

        for (let animeData of animes) {
            const anime = animeData?.attributes
            if (!anime) continue

            const age = {
                G: 1,
                PG: 10,
                R: 16,
                R18: 18
            }[anime.ageRating] || 20

            animeData.age = age
            continue
        }
        
        animes = animes.sort((a, b) => a.age - b.age)

        for (let animeData of animes) {
            const anime = animeData?.attributes
            if (!anime) continue

            const IdadeRating = {
                G: 'Livre',
                PG: '+10 - Orientação dos Pais Sugerida',
                R: '+16 Anos',
                R18: '+18 Anos'
            }[anime.ageRating] || 'Sem faixa etária'

            const emoji = {
                G: e.livre,
                PG: e['+10'],
                R: e['+16'],
                R18: '🔞'
            }[anime.ageRating] || e.QuestionMark

            const animeName = anime?.titles?.en || anime?.titles?.en_jp || anime?.canonicalTitle || null
            if (!animeName || animeName.length > 100) continue

            if (values.includes(animeName)) continue

            selectMenuObject.components[0].options.push({
                emoji,
                label: animeName,
                description: IdadeRating.limit('SelectMenuDescription'),
                value: animeName,
            })

            values.push(animeName)

            continue
        }

        if (selectMenuObject.components[0].options.length > 25)
            selectMenuObject.components[0].options.length = 25

        return selectMenuObject
    }

}