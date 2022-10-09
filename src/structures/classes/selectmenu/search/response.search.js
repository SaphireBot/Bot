import { SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (anime, res, interaction, search) => {

    const Subtype = {
        // Anime
        ONA: 'Animação Original da Net (ONA)',
        OVA: 'Video de Animação Original (OVA)',
        TV: 'Televisão',
        movie: 'Filme',
        music: 'Música',
        special: 'Especial',
        // Manga
        doujin: 'Doujin',
        manga: 'Manga',
        manhua: 'Manhua',
        manhwa: 'Manhwa',
        novel: 'Novel',
        oel: 'Oel',
        oneshot: 'Oneshot',
    }[anime.showType || anime.mangaType] || '\`Not Found\`'

    const Sinopse = res.text?.limit('MessageEmbedDescription') || '\`Synopsis Not Found\`'

    const Status = {
        current: 'Atual',
        finished: 'Finalizado',
        tba: 'Em Breve',
        unreleased: "Inédito",
        upcoming: 'Em Lançamento'
    }[anime.status] || 'Sem status definido'

    const Name = {
        en: anime.titles.en,
        en_jp: anime.titles.en_jp,
        original: anime.titles.ja_jp,
        canonical: anime.canonicalTitle,
        abreviated: anime.abbreviatedTitles
    }

    const IdadeRating = {
        G: 'Livre',
        PG: '+10 - Orientação dos Pais Sugerida',
        R: '+16 Anos',
        R18: '+18 Anos'
    }[anime.ageRating] || 'Sem faixa etária'

    const NSFW = anime.nsfw ? 'Sim' : 'Não'
    const Nota = anime.averageRating || '??'
    const AnimeRanking = anime.ratingRank || '0'
    const AnimePop = anime.popularityRank || '0'
    const Epsodios = anime.episodeCount || 'N/A'
    const Volumes = anime.volumeCount || null

    const Create = anime.createdAt
        ? Date.Timestamp(new Date(anime.createdAt), 'f', true)
        : 'Não criado ainda'

    const LastUpdate = anime.updatedAt
        ? Date.Timestamp(new Date(anime.updatedAt), 'f', true)
        : 'Sem atualização'

    const Lancamento = anime.startDate ? `${new Date(anime.startDate).toLocaleDateString("pt-br")}` : 'Em lançamento'
    const Termino = anime.endDate
        ? new Date(anime.endDate).toLocaleDateString("pt-br")
        : anime.startDate ? 'Ainda no ar' : 'Não lançado'

    return await interaction.editReply({
        content: null,
        embeds: [{
            color: client.green,
            title: `🔍 Pesquisa Requisitada: ${search}`.limit('MessageEmbedTitle'),
            description: `**📑 Sinopse**\n${Sinopse}`,
            fields: [
                {
                    name: '🗂️ Informações',
                    value: `Nome Japonês: ${Name.original || 'Não possue'}\nNome Inglês: ${Name.en || 'Não possue'}\nNome Mundial: ${Name.en_jp || 'Não possue' || 'Não possue'}\nNome Canônico: ${Name.canonical || 'Não possue'}\nNomes abreviados: ${Name.abreviated.join(', ')}\nFaixa Etária: ${IdadeRating}\nNSFW: ${NSFW}\nTipo: ${Subtype}${anime.episodeLength ? `\nTempo médio por epsódio: ${anime.episodeLength} minutos` : ''}`
                },
                {
                    name: `📊 Status - ${Status}`,
                    value: `Nota Média: ${Nota}\nRank Kitsu: ${AnimeRanking}\nPopularidade: ${AnimePop}${Volumes ? `\nVolumes: ${Volumes}` : `\nEpisódios: ${Epsodios}`}\nCriação: ${Create}\nÚltima atualização: ${LastUpdate}\nLançamento: ${Lancamento}\nTérmino: ${Termino}`
                }
            ],
            image: { url: anime.posterImage?.original ? anime.posterImage.original : null },
            footer: { text: '📚 Powered By Kitsu API' }
        }],
        components: []
    })
        .catch(async err => {
            return await interaction.editReply({
                content: `${e.Warn} | Ocorreu um erro no comando "anime"\n> \`${err}\``,
                components: []
            })
        })

}