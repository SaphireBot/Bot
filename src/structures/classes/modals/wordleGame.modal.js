import dicio from 'dicionario.js'

export default async ({ interaction, fields, Database, emojis: e, client }) => {

    const { channel, customId } = interaction
    const query = fields.getTextInputValue('wordleGame')?.toLowerCase()
    const data = await Database.Cache.WordleGame.get(customId)
    const message = await channel.messages.fetch(customId)
    const embed = message.embeds[0]?.data

    if (!message || !embed) {
        await Database.Cache.WordleGame.delete(customId)
        return await interaction.reply({
            content: `${e.Deny} | Jogo inválido.`,
            ephemeral: true
        }).catch(() => deleteGameFromCache())
    }

    return dicio.significado(query?.toLowerCase())
        .then(() => continueGame())
        .catch(async (err) => {
            console.log(err)
            await interaction.reply({
                content: `${e.Deny} | Esta palavra não existe.`,
                ephemeral: true
            })

        }).catch(() => deleteGameFromCache())

    async function continueGame() {
        const place = getPlace()
        return editPlace(place, query === data.Word)
    }

    async function editPlace(place, isWin) {

        const word = data.Word
        data.Try[place] = query.split('')

        for (let i in data.Try[place])
            if (data.Try[place][i] === word[i])
                data.Try[place][i] = e[data.Try[place][i].toUpperCase()]
            else
                if (word.includes(data.Try[place][i]))
                    data.Try[place][i] = e[`+${data.Try[place][i]}`]
                else data.Try[place][i] = e[data.Try[place][i]]

        const allArray = Object.values(data.Try || {})

        for (let [key, value] of Object.entries(data.Try || {}))
            if (key !== place && value.join('') === data.Try[place].join(''))
                return await interaction.reply({
                    content: `${e.Deny} | Esta palavra já foi usada.`,
                    ephemeral: true
                })

        await Database.Cache.WordleGame.set(customId, data)

        let description = ''

        for (let array of allArray) {
            description += array.map(value => value ? value : e.WordleGameRaw).join('')
            description += '\n'
        }

        embed.description = description

        embed.color = isWin
            ? client.green
            : place === 'Six'
                ? client.red
                : embed.color

        if (isWin || place === 'Six') deleteGameFromCache()

        const editData = isWin || place === 'Six'
            ? { embeds: [embed], components: [] }
            : { embeds: [embed] }

        await interaction.deferReply()
        message.edit(editData).catch(() => deleteGameFromCache())
        return await interaction.deleteReply()
    }

    function getPlace() {
        const Tries = Object.entries(data.Try)
        let result
        Tries.some(([key, value]) => !value[0] && (result = key))
        return result
    }

    async function deleteGameFromCache() {
        return await Database.Cache.WordleGame.delete(customId)
    }
}