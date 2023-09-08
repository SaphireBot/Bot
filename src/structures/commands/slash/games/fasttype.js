import { ApplicationCommandOptionType, ButtonStyle, ChatInputCommandInteraction, Collection } from 'discord.js';
import { Emojis as e } from '../../../../util/util.js';
import { createRequire } from 'node:module';
export const FastTypesGames = {};
const require = createRequire(import.meta.url);
const phrases = require("./fasttype/phrases.fasttype.json");
const gameEnable = new Collection();

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
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    /**
     * @param { ChatInputCommandInteraction } interaction 
     * @returns 
     */
    async execute({ interaction }, commandData) {

        const { user, channel } = interaction

        if (gameEnable.get(user.id))
            return interaction.reply({
                content: `${e.Animated.SaphireReading} | Opa! Eu ví aqui e você já tem uma frase te esperando.`,
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: "Ver frase não respondida",
                                emoji: "🔎",
                                url: gameEnable.get(user.id)?.url,
                                style: ButtonStyle.Link
                            }
                        ]
                    }
                ]
            })

        const phraseId = commandData?.pId || interaction?.options?.getInteger("phrase")

        if (typeof phraseId == "number" && (phraseId > phrases.length || phraseId < 1))
            return interaction.reply({
                content: `${e.Animated.SaphireReading} | Hey, essa frase não existe.`,
                ephemeral: true
            })

        const fasttype = typeof phraseId == "number"
            ? phrases.find(v => v.id == phraseId)
            : phrases.random()

        if (!fasttype?.id || !fasttype?.phrase)
            return interaction.reply({
                content: `${e.DenyX} | Por algum motivo, não achei nenhuma frase...`
            })

        FastTypesGames[`${channel.id}_${user.id}.startedAt`] = Date.now()
        const message = await interaction.reply({
            content: `⏱️ | ${fasttype.phrase}`,
            fetchReply: true
        })
            .catch(err => {
                date = null
                channel.send({
                    content: `${e.Animated.SaphirePanic} | ${user}, não deu bom quando fui enviar a sua mensagem.\n${e.bug} | \`${err}\``
                }).catch(() => { })
                return
            })

        gameEnable.set(user.id, message)

        /** @type { string } */
        const phrase = fasttype.phrase
        const WPM = phrase.trim().replace(/([áàâãéèêíïóôõöúçñ])/ig, "$1a").length * 115

        const collector = channel.createMessageCollector({
            filter: msg => msg.author.id == user.id,
            idle: 1000 * 20,
            max: 5
        })
            .on("collect", msg => {

                const sendingDelay = Date.now() - FastTypesGames[`${channel.id}_${user.id}.startedAt`]
                FastTypesGames[`${channel.id}_${user.id}.startedAt`] = Date.now()

                if (msg.content?.toLowerCase() !== phrase?.toLowerCase()) return

                if (sendingDelay < WPM) {
                    message.edit({ content: message.content += `\n${e.DenyX} | Rápido demais para um ser humano.` }).catch(() => { })
                    return collector.stop("premature")
                }

                if (!FastTypesGames[`${channel.id}_${user.id}.typingStarted`]) {
                    message.edit({ content: message.content += `\n${e.DenyX} | Ué... Eu não vi você digitar.` }).catch(() => { })
                    return collector.stop("no_typing")
                }

                if (msg.content?.toLowerCase() == phrase?.toLowerCase()) {
                    msg.react(e.CheckV).catch(() => { })
                    message.edit({
                        content: message.content += `\n${e.CheckV} | Frase digitada em \`${Date.stringDate(sendingDelay, true)}\``,
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2,
                                        label: 'Nova Frase',
                                        emoji: e.Animated.SaphireReading,
                                        custom_id: JSON.stringify({ c: 'fasttype' }),
                                        style: ButtonStyle.Primary
                                    },
                                    {
                                        type: 2,
                                        label: 'Mesma Frase',
                                        emoji: e.Stonks,
                                        custom_id: JSON.stringify({ c: 'fasttype', pId: fasttype.id }),
                                        style: ButtonStyle.Primary
                                    }
                                ]
                            }
                        ]
                    }).catch(console.log)
                    return collector.stop("success")
                }

                return
            })
            .on("end", (_, reason) => {

                console.log(reason)

                delete FastTypesGames[`${channel.id}_${user.id}.startedAt`]
                delete FastTypesGames[`${channel.id}_${user.id}.typingStarted`]
                gameEnable.delete(user.id)

                const content = {
                    premature: `${e.Animated.SaphireReading} | ${user}, não pode copiar e colar, sabia?`,
                    no_typing: `${e.Animated.SaphireQuestion} | ${user}, hum.... eu não vi você digitando... Isso foi realmente rápido.`,
                    channelDelete: undefined,
                    idle: `${e.Animated.SaphireSleeping} | ${user}, você demorou muito para digitar... Tirei um cochilo aqui, ok?`,
                    limit: `${e.Animated.SaphireReading} | ${user}, você passou do limite de 5 tentativas.`,
                }[reason]

                if (reason == "idle")
                    message.edit({
                        content: message.content += `\n${e.Animated.SaphireSleeping} | Se passou tanto tempo que eu esqueci de contar o tempo.`
                    }).catch(() => { })

                if (content)
                    return channel.send({
                        content,
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2,
                                        label: 'Nova Frase',
                                        emoji: e.Animated.SaphireReading,
                                        custom_id: JSON.stringify({ c: 'fasttype' }),
                                        style: ButtonStyle.Primary
                                    },
                                    {
                                        type: 2,
                                        label: 'Mesma Frase',
                                        emoji: e.Stonks,
                                        custom_id: JSON.stringify({ c: 'fasttype', pId: fasttype.id }),
                                        style: ButtonStyle.Primary
                                    }
                                ]
                            }
                        ]
                    })

            })
    }
}