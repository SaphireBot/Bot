import { ApplicationCommandOptionType } from 'discord.js'
import weather from 'weather-js'

export default {
    name: 'weather',
    description: '[util] Confira o clima de uma cidade',
    category: "util",
    name_localizations: { "en-US": "weather", 'pt-BR': 'clima' },
    dm_permission: false,
    database: false,
    type: 1,
    options: [
        {
            name: 'cidade',
            type: ApplicationCommandOptionType.String,
            description: 'De qual cidade você quer ver o clima?',
            required: true
        }
    ],
    helpData: {
        description: 'Um simples comando para verificar o clima'
    },
    apiData: {
        name: "weather",
        description: "Confira o clima de alguma cidade",
        category: "Utilidades",
        synonyms: ["clima"],
        perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, client, e }) {

        const { options, locale } = interaction
        const query = options.getString('cidade')

        await interaction.reply({
            content: `${e.Loading} | Obtendo dados...`
        })

        return await weather.find({
            search: query,
            lange: locale,
            degreeType: 'C'
        }, execute)

        async function execute(err, result) {

            if (err || !result || !result.length)
                return await interaction.editReply({
                    content: `${e.Deny} | Não foi possível concluir a busca desta cidade.`,
                    ephemeral: true
                })

            const location = result[0].location
            const weather = result[0].current
            const forecast = result[0].forecast

            const weekDay = {
                Sunday: 'Domingo',
                Monday: 'Segunda-Feira',
                Tuesday: 'Terça-feira',
                Wednesday: 'Quarta-feira',
                Thursday: 'Quinta-feira',
                Friday: 'Sexta-feira',
                Saturday: 'Sábado'
            }[weather.day] || 'Not Found'

            const skytext = {
                'Clear': 'Com o céu limpo',
                'Mostly Clear': 'Com o céu completamente limpo',
                'Sunny': 'Com o céu ensolarado',
                'Mostly Sunny': 'Com o céu super ensolarado',
                'Partly Sunny': 'Com o céu parcialmente ensolarado',
                'Cloudy': 'Com o céu nublado',
                'Partly Cloudy': 'Com o céu parcialmente nublado',
                'Mostly Cloudy': 'Com o céu muito nublado',
                'Rain': 'Com chuva',
                'Rain Showers': 'Com pancadas de chuvas',
                'Light Rain': 'Com chuvas leves',
                'T-Storms': 'Com tempestades'
            }

            if (!skytext[weather.skytext])
                console.log(weather.skytext)

            const embed = {
                color: client.blue,
                title: `🔎 ${client.user.username}'s Clima | ${location.name || 'Not Found'}`,
                description: `🗺 - \`LAT: ${location.lat} | LONG: ${location.long}\`\n🌐 - Fuso Horário: \`${location.timezone}\``,
                thumbnail: { url: weather.imageUrl || null },
                fields: [
                    {
                        name: `${e.Info} Clima atual`,
                        value: `A temperatura atual é de ${weather.temperature}°C com sensação térmica de ${weather.feelslike}°C.\n${skytext[weather.skytext]}, a humidade do ar é de ${weather.humidity}% com ventos de ${weather.windspeed}.\nOs dados foram pegos em ${weather.observationpoint} (${weekDay}) as ${weather.observationtime}.`.limit('MessageEmbedFieldValue')
                    }
                ],
                footer: {
                    text: '❤ Powered By Microsoft'
                }
            }

            if (forecast.length > 5)
                forecast.length = 5

            const skyEmoji = {
                'Clear': '☁',
                'Mostly Clear': '✨',
                'Sunny': '🌞',
                'Partly Sunny': '🌤',
                'Mostly Sunny': '☀',
                'Cloudy': '🌫',
                'Partly Cloudy': '🌫🌫',
                'Mostly Cloudy': '🌫🌫🌫',
                'Rain': '🌧',
                'Light Rain': '🌦',
                'Rain Showers': '🌧🌧',
                'T-Storms': '⛈'
            }

            for (let data of forecast) {

                if (!skytext[data.skytextday])
                    console.log(data.skytextday)

                embed.fields.push({
                    name: skyEmoji[data.skytextday] + ` ${forecast[0].date === data.date ? 'Amanhã' : `${Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date(data?.date))}`.captalize(false)}`,
                    value: `Máxima de ${data?.high}°c com mínima de ${data?.low}°c\n${skytext[data.skytextday] || data.skytextday}, terá ${data?.precip}% de chance de chuva.`
                })
            }

            return await interaction.editReply({
                content: null,
                embeds: [embed]
            })
        }

    }
}