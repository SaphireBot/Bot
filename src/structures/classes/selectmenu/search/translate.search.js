import translate from "@iamtraction/google-translate"
import axios from "axios"
import { Emojis as e } from "../../../../util/util.js"
import responseSearch from "./response.search.js"

export default async ({ interaction, value, customId }) => {

    await interaction.update({
        content: `${e.Loading} | Carregando e traduzindo informações...`,
        components: []
    }).catch(() => { })

    const lookingFor = customId.includes('anime')
        ? 'anime'
        : 'manga'

    return axios({
        baseURL: `https://kitsu.io/api/edge/${lookingFor}?filter[text]=${value
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

            const anime = result?.data?.data[0]?.attributes || null

            if (!anime)
                return await interaction.editReply({
                    content: `${e.Deny} | Nenhum resultado obtido para a sua busca.`,
                    components: []
                }).catch(() => { })

            const res = await translate(`${anime.synopsis.replace(/<[^>]*>/g, '')
                .split('\n')[0]}`, { to: 'pt' })
                .catch(() => null)

            if (!res)
                return await interaction.editReply({
                    content: `${e.Deny} | Erro na tradução`,
                    components: []
                }).catch(() => { })

            return responseSearch(anime, res, interaction, value)
        })
        .catch(async err => {
            console.log(err)
            return await interaction.editReply({
                content: `${e.Deny} | Anime não encontrado.`,
                components: []
            }).catch(() => { })
        })
}
