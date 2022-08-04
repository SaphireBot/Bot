import * as fs from 'fs'
import { Emojis as e } from '../../../../util/util.js'
import {
    Database,
    SaphireClient as client
} from '../../../../classes/index.js'

export default async (interaction, playersAvailable = []) => {

    const { options, user } = interaction

    const allWords = JSON.parse(fs.readFileSync('./src/JSON/frases.json')).Mix
    const optionGiven = options.getInteger('letras') || 4
    const length = optionGiven >= 1 || optionGiven <= 7 ? optionGiven : 4
    const wordsInLength = allWords.filter(word =>
        word.length === length
        &&
        /^[a-z]+$/i.test(word.toLowerCase())
    )

    const msg = await interaction.reply({
        content: `${e.Loading} | Construindo novo Wordle Game...`,
        fetchReply: true
    })

    const Try = {
        One: [],
        Two: [],
        Three: [],
        Four: [],
        Five: [],
        Six: []
    }

    for (let i = 0; i < length; i++) {
        Try.One.push('')
        Try.Two.push('')
        Try.Three.push('')
        Try.Four.push('')
        Try.Five.push('')
        Try.Six.push('')
    }

    const allArray = Object.values(Try)

    const gameData = {
        Word: wordsInLength.random(),
        Players: [user.id],
        MessageId: msg.id,
        Length: length,
        Try
    }

    if (playersAvailable.length)
        gameData.Players.push(...playersAvailable)

    await Database.Cache.WordleGame.set(msg.id, gameData)
    await Database.Cache.WordleGame.push('inGame', { userId: interaction.user.id, messageId: msg.id })

    let description = ''

    for (let array of allArray) {
        description += array.map(value => e.WordleGameRaw).join('')
        description += '\n'
    }

    const embed = {
        color: client.blue,
        title: `${client.user.username}'s Wordle Game`,
        description
    }

    const button = {
        type: 1,
        components: [
            {
                type: 2,
                emoji: '📝',
                custom_id: msg.id,
                style: 3
            },
            {
                type: 2,
                emoji: `${e.Info}`,
                custom_id: 'WordleGameInfo',
                style: 1
            },
            {
                type: 2,
                emoji: '🏳️',
                custom_id: 'giveup',
                style: 4
            }
        ]
    }

    return setTimeout(async () => {
        return await interaction.editReply({
            content: null,
            embeds: [embed],
            components: [button]
        })
    }, 1000)
}