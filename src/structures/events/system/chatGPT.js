import { ButtonStyle, Message } from "discord.js";
import { Configuration, OpenAIApi } from 'openai';
import { Emojis as e } from "../../../util/util.js";
const configuration = new Configuration({ apiKey: `${process.env.CHAT_GPT_KEY}` });
const openai = new OpenAIApi(configuration);
const onThinking = {}
const ratelimit = { onTimeout: false, remaning: 3 }

/**
 * @param { Message } message
 */
export default async message => {

    if (ratelimit.onTimeout)
        return message.reply({
            content: `${e.SaphireDesespero} | Meu sistema está pegando foooogo 🔥\n🧑‍🚒 | Espera aí que os bombeiros do Rate Limit estão tomando as devidas previdências`
        }).then(msg => setTimeout(() => msg.delete().catch(() => { }), 1000 * 15))

    const Message = await message.reply({ content: `${e.Loading} | Pera aí, deixa eu pensar...` })
    onThinking[Message.id] = true
    thinking()

    const response = await openai
        .createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: 'user', content: message.content }]
        })
        .then(data => {

            if (
                ratelimit.remaning == 0
                || data.statusText == 'Too Many Requests'
                || data.status == 429
            ) {
                resetRequests()
                Message.edit({ content: `${e.Warn} | Meu sistema de resposta inteligente está sob ratelimit. Por favor, tente daqui a pouco.` }).catch(() => { })
                return false
            }

            ratelimit.remaning = data.headers['x-ratelimit-limit-requests']
            if (ratelimit.remaning == 0) resetRequests()
            return data?.data?.choices?.random()?.message?.content
        })
        .catch(err => {
            err = err.toJSON()

            if (
                ratelimit.remaning == 0
                || err.message == 'Request failed with status code 429'
                || err.status == 429
            ) {
                resetRequests()
                Message.edit({ content: `${e.Warn} | Meu sistema de resposta inteligente está sob ratelimit. Por favor, tente daqui a pouco.` }).catch(() => { })
                return 0
            }

            console.log(err)
            Message.edit({
                content: `${e.SaphireDesespero} | A MEU DEUS, DEU ERRO AQUI\n${e.bug} | \`${err}\``
            }).catch(() => { })
            return 0
        })

    delete onThinking[Message.id]
    if (response == 0) return

    if (!response)
        return Message.edit({
            content: `${e.Animated.SaphireCry} | Eu não sei responder sua pergunta.`
        }).catch(() => { })

    return Message.edit({
        content: response.limit('MessageContent'),
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Deletar Mensagem',
                        emoji: e.Trash,
                        custom_id: JSON.stringify({ c: 'delete', userId: message.author.id }),
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ]
    }).catch(() => Message.delete().catch(() => { }))

    function thinking() {
        const responses = [
            `${e.Loading} | Calma calma, eu ainda estou pensando...`,
            `${e.Loading} | Espera um pouco, deixa eu pensar um pouco mais...`,
            `${e.Loading} | Um momento...`
        ]

        const interval = setInterval(() => {
            if (!onThinking[Message.id]) return clearInterval(interval)
            Message.edit({ content: responses.random() }).catch(() => Message.edit({ content: `${e.SaphireDesespero} | Não foi possível editar a mensagem...` }).catch(() => { }))
        }, 1000 * 5)
    }

    function resetRequests() {
        if (ratelimit.onTimeout) return
        ratelimit.onTimeout = true
        setTimeout(() => {
            ratelimit.remaning = 3
            ratelimit.onTimeout = false
        }, 1000 * 60)
    }
}