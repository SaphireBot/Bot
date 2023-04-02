import { ChatInputCommandInteraction } from "discord.js"
import { Emojis as e } from "../../../../../../util/util.js"
import { Database, SaphireClient as client } from "../../../../../../classes/index.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    const { guild } = interaction

    const data = await Database.Guild.findOne({ id: guild.id })
    const twitchData = data?.TwitchNotifications || []

    const description = twitchData.length
        ? twitchData.map(tw => `\`${tw.streamer}\` -> <#${tw.channelId}>${tw.roleId ? ` -> <@&${tw.roleId}>` : ''}`).join('\n').limit('MessageEmbedDescription')
        : 'Nenhum streamer cadastrado ainda.'

    return interaction.reply({
        embeds: [
            {
                color: 0x9c44fb,
                title: `${e.Notification} Informações do Comando/Sistema Twitch`,
                description: `Este sistema permite que você receba notificações aqui no servidor toda vez que o seu streamer favorito entrar em live na Twitch.\nDesde a última vez que eu reiniciei, eu já enviei ${client.twitchNotifications} notificações.`,
                fields: [
                    {
                        name: '📝 Campo Streamer (Obrigatório)',
                        value: `Nome ou URL do canal do streamer na Twitch.\nex: *\`alanzoka\` ou \`https://www.twitch.tv/alanzoka\`*`
                    },
                    {
                        name: '📝 Campo canal_do_servidor (Obrigatório)',
                        value: `Aqui é onde você escolhe em qual canal do servidor eu devo notificar enviar a notificação.`
                    },
                    {
                        name: '📝 Campo cargo_a_ser_mencionado (Opicional)',
                        value: `Você pode escolher um cargo para eu @mencionar na hora da notificação.`
                    },
                    {
                        name: '📝 Campo mensagem_de_notificação (Opicional)',
                        value: `Você também pode escolher a mensagem que eu vou mandar.\nUse \`$role\` para eu colocar o cargo que você escolheu\nUse \`$streamer\` para eu colocar o streamer\nExemplo: \`O $streamer está online $role.\`\nResultado: \`O Alanzoka está online @Live Notification\``
                    },
                    {
                        name: `${e.QuestionMark} Limites`,
                        value: 'Até agora, não possui limites de cadastros de streamers por servidor.'
                    },
                    {
                        name: `${e.Info} Limitações`,
                        value: 'Só é possível configurar **1 canal por streamer**.\nA mensagem de notificação pode possuir até **700 caracteres**.\nPode levar de **5 segundos a 10 minutos** para a notificação ser enviada.'
                    }
                ],
                footer: {
                    text: `${client.user.username}'s Twitch Notification System`,
                    icon_url: 'https://freelogopng.com/images/all_img/1656152623twitch-logo-round.png',
                },
            },
            {
                color: 0x9c44fb,
                title: `${e.Commands} Lista de Streamers e Seus Canais`,
                description,
                footer: { text: `${twitchData.length} streamers registrados` }
            }
        ]
    })

}