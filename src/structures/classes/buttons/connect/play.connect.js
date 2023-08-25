import { ButtonStyle } from "discord.js"
import { Database, SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import check from "./check.connect.js"

export default async (interaction, commandData) => {

    const { message, user } = interaction
    const gameData = await Database.Cache.Connect.get(message.id)

    if (!gameData)
        return interaction.update({
            content: `${e.DenyX} | Jogo não encontrado.`,
            embeds: [], components: []
        }).catch(() => { })

    if (!gameData?.players.includes(user.id))
        return interaction.reply({
            content: `${e.Animated.SaphireCry} | Você não está participando deste jogo.`,
            ephemeral: true
        })

    const { i } = commandData
    const { playNow: userId, emojiPlayer } = gameData
    const emojiNumbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"]
    let lines = gameData.lines.reverse()

    if (userId !== user.id)
        return interaction.reply({
            content: `${e.Animated.SaphirePanic} | Calma calma, não é a sua vez agora.`,
            ephemeral: true
        })

    const emoji = emojiPlayer[userId]

    for (let line of lines)
        if (line[i] == e.white) {
            line[i] = emoji
            break;
        } else continue

    lines = lines.reverse()

    gameData.history[userId].push(emojiNumbers[i])
    const emojiWinner = check(lines)
    if (emojiWinner) return newWinner()

    return buildEmbedAndUpdate()
    async function buildEmbedAndUpdate() {

        const components = buildComponents()

        if ([...components[0].components, ...components[1].components].every(button => button.disabled))
            return draw()

        const playNow = gameData.playNow == gameData.players[0]
            ? gameData.players[1]
            : gameData.players[0]

        await Database.Cache.Connect.set(message.id, {
            players: gameData.players,
            lines,
            playNow,
            emojiPlayer: gameData.emojiPlayer,
            history: gameData.history
        })

        return interaction.update({
            content: `${e.Loading} Aguardando <@${playNow}> ${emojiPlayer[playNow]} fazer sua jogada`,
            embeds: [{
                color: client.blue,
                title: `${client.user.username}'s Connect4`,
                fields: [
                    {
                        name: `🕳️ Tabuleiro`,
                        value: lines.map(line => line.join('|')).join('\n') + `\n${emojiNumbers.join('|')}`,
                    },
                    {
                        name: '📝 Histórico de Jogadas',
                        value: Object.entries(gameData.history).map(([id, array]) => `<@${id}> ${array.join(' ')}`).join('\n') || 'Nada por aqui'
                    }
                ]
            }],
            components,
            ephemeral: true
        })
            .catch(async err => {
                if (err.code == 10062) return interaction.channel.send({ connect: `${e.Animated.SaphireCry} | ${interaction.user}, o Discord não entregou todos os dados necessário. Pode clicar no botão mais uma vez?` })
                await Database.Cache.Connect.delete(message.id)
                return interaction.channel.send({ content: `${e.Animated.SaphireCry} | Erro ao iniciar o jogo\n${e.bug} | \`${err}\`` })
            })
    }

    function isComplete(index) {

        for (let i = 0; i <= 6; i++)
            if (lines[i][index] == e.white) return false

        return true
    }

    function buildComponents() {

        const components = [{ type: 1, components: [] }, { type: 1, components: [] }]

        for (let i = 0; i <= 3; i++)
            components[0].components.push({
                type: 2,
                emoji: emojiNumbers[i],
                custom_id: JSON.stringify({ c: 'connect', src: 'play', i: i }),
                style: ButtonStyle.Secondary,
                disabled: isComplete(i)
            })

        for (let i = 4; i <= 6; i++)
            components[1].components.push({
                type: 2,
                emoji: emojiNumbers[i],
                custom_id: JSON.stringify({ c: 'connect', src: 'play', i: i }),
                style: ButtonStyle.Secondary,
                disabled: isComplete(i)
            })

        return components
    }

    async function newWinner() {

        await Database.Cache.Connect.delete(message.id)
        const emojiData = Object.entries(emojiPlayer)
        const winnerId = emojiData.find(data => data[1] == emojiWinner)[0]
        const embed = interaction.message.embeds[0]?.data

        if (!embed)
            return interaction.update({
                content: `${e.Deny} | Embed não encontrada.`,
                components: []
            }).catch(() => { })

        embed.color = emojiWinner == e.red ? 0xdd2e44 : 0xfdcb58
        if (!embed.fields || !Array.isArray(embed.fields)) embed.fields = []

        embed.fields[0].value = lines.map(line => line.join('|')).join('\n') + `\n${emojiNumbers.join('|')}`
        embed.fields[1].value = Object.entries(gameData.history).map(([id, array]) => `<@${id}> ${array.join(' ')}`).join('\n') || 'Nada por aqui'
        embed.description = `👑 <@${winnerId}> ganhou com as peças ${emojiWinner}`

        return interaction.update({ content: null, embeds: [embed], components: [] }).catch(() => { })

    }

    async function draw() {

        await Database.Cache.Connect.delete(message.id)
        const embed = interaction.message.embeds[0]?.data

        if (!embed)
            return interaction.update({
                content: `${e.Deny} | Embed não encontrada.`,
                components: []
            }).catch(() => { })

        embed.color = 0xe6e7e8
        if (!embed.fields || !Array.isArray(embed.fields)) embed.fields = []

        embed.fields[0].value = lines.map(line => line.join('|')).join('\n') + `\n${emojiNumbers.join('|')}`
        embed.fields[1].value = Object.entries(gameData.history).map(([id, array]) => `<@${id}> ${array.join(' ')}`).join('\n') || 'Nada por aqui'
        embed.description = `🏳️🏳️ Empate 🏳️🏳️`

        return interaction.update({ content: null, embeds: [embed], components: [] }).catch(() => { })

    }

}