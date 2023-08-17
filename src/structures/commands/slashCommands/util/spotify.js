import { ApplicationCommandOptionType } from 'discord.js'
import { Database, SaphireClient as client } from '../../../../classes/index.js'
import { Emojis as e } from '../../../../util/util.js'
import { Config } from '../../../../util/Constants.js'

export default {
    name: 'spotify',
    description: '[util] Um simples comando integrado ao Spotify',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'search',
            description: 'Pesquise por músicas no spotify',
            type: ApplicationCommandOptionType.String,
            required: true,
            max_length: 50
        }
    ],
    apiData: {
        name: "spotify",
        description: "Pesquise e escute um trecho de uma música no Spotify",
        category: "Utilidades",
        synonyms: [],
        perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction }) {

        const msg = await interaction.reply({ content: `${e.Loading} | Pesquisando música no Spotify...`, fetchReply: true })
        const { options } = interaction
        const query = options.getString('search')
        const tracks = await getTracks(query)

        const error = {
            refresh: `${e.Info} | Meu token de acesso ao spotify está reiniciando, por favor, tente novamente.`,
            ratelimit: `${e.Animated.SaphireSleeping} | O meu acesso ao Spotify está sob rate-limit. Por favor, tente daqui uns minutos.`,
            unauthorized: `${e.Animated.SaphireCry} | Por algum motivo eu não tenho autorização pra pesquisar músicas no Spotify`,
            forbidden: `${e.saphireDesespero} | Eu estou proibida de buscar músicas no Spotify`,
            'not found': `${e.Animated.SaphireCry} | Nada foi encontrado`,
            500: `${e.SaphireIndignada} | Deu erro na API da Spotify`,
            unavailable: `${e.Animated.SaphireSleeping} | Os serviços do Spotify não estão disponíveis no momento.`
        }[tracks]

        if (error)
            return interaction.editReply({ content: error }).catch(() => { })

        if (!tracks?.length)
            return interaction.editReply({
                content: `${e.Animated.SaphireCry} | Eu não achei nenhuma música no Spotify.`
            })

        const content = []
        const components = [{
            type: 1,
            components: [{
                type: 3,
                custom_id: 'menu',
                placeholder: 'Selecionar Música',
                options: []
            }]
        }]

        for (const i in tracks) {
            const data = tracks[i]
            if (typeof data == 'function') continue
            const album = data.album
            content.push({
                content: `${e.Animated.SaphireDance} | [${data.name}](${data?.external_urls?.spotify}) \`${Date.stringDate(data.duration_ms)}\`${album ? `\n📝 | ${data.album.artists.map(artist => `[${artist.name}](${artist.external_urls.spotify})`).join(', ')}` : ''}`
            })
            const artists = data.album?.artists?.map(artist => artist?.name).join(', ') || 'Nada por aqui'
            components[0].components[0].options.push({
                label: data.name,
                emoji: e.Animated.SaphireDance,
                description: artists,
                value: `${i}`,
            })
        }

        await interaction.editReply({ ...content[0], components }).catch(() => { })

        return msg.createMessageComponentCollector({
            filter: int => int.user.id === interaction.user.id,
            idle: 1000 * 60 * 10
        })
            .on('collect', int => int.update({ ...content[Number(int.values[0])] }))
            .on('end', () => {
                msg.edit({ components: [] }).catch(() => { })
            })

    }
}

async function getTracks(query) {
    return await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=25`, {
        headers: { Authorization: `Bearer ${Config.SpotifyAccessToken}`, },
        method: 'GET'
    })
        .then(async res => {
            const data = await res.json()

            const statusError = {
                429: 'ratelimit',
                401: 'refresh',
                403: 'forbidden',
                404: 'not found',
                500: 500,
                503: 'unavailable'
            }[data?.error?.status]

            if ([401].includes(data?.error?.status)) refreshToken()
            if (statusError) return statusError

            return data?.tracks?.items || []
        })
        .catch(() => [])

}

async function refreshToken() {
    return await fetch(`https://accounts.spotify.com/api/token?grant_type=client_credentials&client_id=${process.env.SPOTIFY_CLIENT_ID}&client_secret=${process.env.SPOTIFY_CLIENT_SECRET}`, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        method: 'POST'
    })
        .then(async res => {
            const data = await res.json()
            if (data?.error) return

            Config.SpotifyAccessToken = data.access_token
            await Database.Client.updateOne(
                { id: client.user.id },
                { $set: { SpotifyAccessToken: data.access_token } }
            )

            setTimeout(() => refreshToken(), Number(data.expires_in) * 1000)
        })
}