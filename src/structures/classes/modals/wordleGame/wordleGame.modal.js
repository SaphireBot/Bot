import dicio from 'vxdicionario'

export default async ({ interaction, fields, Database, client, emojis: e }) => {

    const query = fields.getTextInputValue('wordleGame')?.toLowerCase()

    if (!/^[a-z]+$/i.test(query))
        return await interaction.reply({
            content: `${e.Deny} | Palavra com acentos e "ç" são invalidas.`,
            ephemeral: true
        })

    const { channel, customId } = interaction
    const data = await Database.Cache.WordleGame.get(customId)
    const message = await channel.messages.fetch(customId)
    const embed = message.embeds[0]?.data

    if (!data || !message || !embed) {
        await Database.Cache.WordleGame.delete(customId)
        return interaction.reply({
            content: `${e.Deny} | Jogo inválido ou já terminado.`,
            ephemeral: true
        }).catch(() => deleteGameFromCache())
    }

    return await dicio(query?.toLowerCase())
        .then(res => {

            return res.status === 200
                ? editPlace()
                : interaction.reply({
                    content: `${e.Deny} | Esta palavra não existe.`,
                    ephemeral: true
                })
        })
        .catch(() => interaction.reply({ content: `${e.Deny} | Esta palavra não existe.`, ephemeral: true })).catch(() => deleteGameFromCache())

    async function editPlace() {

        const place = getPlace()
        const word = data.Word
        const isWin = query === word

        data.Try[place] = query.split('')
        data.Players = [...new Set(data.Players)]

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

        if (data.Players.length > 1) {

            if (typeof embed.fields !== 'array') embed.fields = []

            embed.fields[0] = {
                name: `👥 Jogadores (${data.Players.length})`,
                value: `${[...new Set(data.Players)].slice(0, 10).map(userId => `<@${userId}>`).join('\n')}`
            }
        }

        const editData = { embeds: [embed] }

        if (place === 'Six') {
            embed.color = client.red
            embed.title = `Wordle Game - PERDEU`
            embed.footer = { text: `Palavra: ${word}` }
            editData.components = []
            deleteGameFromCache()
        }

        if (isWin) {
            embed.color = client.green
            embed.title = `Wordle Game - GANHOU`
            editData.components = []
            deleteGameFromCache()
        }

        await interaction.deferReply().catch(() => { })
        message.edit(editData).catch(() => deleteGameFromCache())
        return await interaction.deleteReply().catch(() => deleteGameFromCache())
    }

    function getPlace() {
        const Tries = Object.entries(data.Try)
        let result
        Tries.some(([key, value]) => !value[0] && (result = key))
        return result
    }

    async function deleteGameFromCache() {
        await Database.Cache.WordleGame.delete(customId)
        return await Database.Cache.WordleGame.pull('inGame', data => data?.messageId === customId)
    }
}