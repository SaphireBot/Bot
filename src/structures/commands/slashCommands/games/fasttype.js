import { ApplicationCommandOptionType, ChatInputCommandInteraction, Collection } from 'discord.js'
import { Emojis as e } from '../../../../util/util.js'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const phrases = require("./fasttype/phrases.fasttype.json")
const gameEnable = new Collection()

export default {
    name: 'fasttype',
    name_localizations: { 'pt-BR': 'escreva_rápido' },
    description: '[game] O quão rápido você pode digitar?',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: "phrase",
            name_localizations: { 'pt-BR': 'frase' },
            description: "Escolha um frase de sua preferência (1~200)",
            type: ApplicationCommandOptionType.Integer,
            autocomplete: true
        }
    ],
    apiData: {
        name: "fasttype",
        description: "Escreva o mais rápido possível!",
        category: "Diversão",
        synonyms: ["escreva_rápido"],
        perms: {
            user: [],
            bot: []
        }
    },
    // async execute({ interaction }) {
    /**
     * @param { ChatInputCommandInteraction } interaction 
     * @returns 
     */
    async execute({ interaction }) {

        return interaction.reply({
            content: `${e.Loading} | Estamos contruindo esse jogo, volte mais tarde.`,
            ephemeral: true
        })

        const { options, user, channel } = interaction
        const phraseId = options.getInteger("phrase")

        if (typeof phraseId == "number" && (phraseId > phrases.length || phraseId < 1))
            return interaction.reply({
                content: `${e.Animated.SaphireReading} | Hey, essa frase não existe.`,
                ephemeral: true
            })

        const fasttype = typeof phraseId == "number"
            ? phrases.find(v => v.id == phraseId)
            : phrases.random()

        if (gameEnable.get(user.id))
            return interaction.reply({
                content: `${e.Animated.SaphireReading} | Opa! Eu ví aqui e você já tem uma frase te esperando.\n🖇️ | ${gameEnable.get(user.id)?.url}`
            })

        let sended
        const message = await interaction.reply({
            content: `⏱️ | ${fasttype.phrase}`,
            fetchReply: true
        })
            .then(msg => {
                sended = Date.now()
                return msg
            })
            .catch(err => {
                sended = null
                channel.send({
                    content: `${e.Animated.SaphirePanic} | ${user}, não deu bom quando fui enviar a sua mensagem.\n${e.bug} | \`${err}\``
                }).catch(() => { })
                return
            })

        if (sended === null) return

        gameEnable.set(user.id, message)

        const recommended = fasttype.phrase

        channel.createMessageCollector({
            filter: msg => msg.author.id == user.id,
            idle: 1000 * 20,
            max: 5
        })
            .on("collect", msg => {



            })
            .on("end")
    }
}