import { ButtonStyle, ChatInputCommandInteraction, ButtonInteraction } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { SaphireClient as client } from "../../../../classes/index.js"
import hmfull from 'hmfull'

/**
 * @param { ChatInputCommandInteraction | ButtonInteraction } interaction
 * @param { { c: 'nsfw', src: 'images', type: string } } commandData
 */
export default async (interaction, commandData) => {

    const { options, user, guild } = interaction
    const category = commandData?.type || options.getString('category')

    if (
        commandData
        && commandData?.type != 'send'
        && user.id != interaction.message?.interaction?.user?.id
    )
        return interaction.reply({
            content: `${e.Deny} | Você não pode clicar aqui, ok?`,
            ephemeral: true
        })

    if (commandData && commandData?.type == "send") {
        const embed = interaction.message?.embeds[0]?.data
        if (!embed)
            return interaction.reply({
                content: `${e.Deny} | Embed não encontrada.`,
                ephemeral: true
            })

        return user.send({
            embeds: [embed],
            components: [{
                type: 1,
                components: [{
                    type: 2,
                    label: `From ${guild.name}`.limit("ButtonLabel"),
                    custom_id: 'sended',
                    style: ButtonStyle.Secondary,
                    disabled: true
                }]
            }]
        })
            .then(() => interaction.reply({
                content: `📨 | Enviei no seu privado ${user}. Segredo nosso...`,
                ephemeral: true
            }))
            .catch(err => {

                if (err.code == 50007)
                    return interaction.reply({
                        content: `${e.Animated.SaphireCry} | Poooxa, a sua DM está trancada ${user}. Abre ela e clica no botão de novo, ok?`,
                        ephemeral: true
                    })

                return interaction.reply({
                    content: `${e.SaphireDesespero} | Não consegui enviar a foto no seu privado...\n${e.bug} | \`${err}\``,
                    ephemeral: true
                })
            })

    }

    if (commandData)
        await interaction.update({
            content: null,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Atualizando',
                            emoji: e.Loading,
                            custom_id: 'loading',
                            style: ButtonStyle.Primary,
                            disabled: true,
                        }
                    ]
                }
            ]
        }).catch(() => { })
    else
        await interaction.reply({
            content: `${e.Loading} | Carregando imagem...`
        })

    const image = await getUrl()

    if (!image || !image.url)
        return interaction.editReply({
            content: `${e.Animated.SaphireCry} | Eu não achei nenhuma imagem...`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: "Outra Imagem",
                            emoji: "🔄",
                            custom_id: JSON.stringify({ c: 'nsfw', src: 'images', type: category }),
                            style: ButtonStyle.Primary
                        }
                    ]
                }
            ]
        }).catch(() => { })

    return interaction.editReply({
        content: null,
        embeds: [{
            color: client.blue,
            title: '🔞 NSFW Images Content',
            image: {
                url: image.url
            }
        }],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        // label: "Abrir no Navegador",
                        emoji: '🖇️',
                        url: image.url,
                        style: ButtonStyle.Link
                    },
                    {
                        type: 2,
                        // label: "Salvar no Privado",
                        emoji: "📨",
                        custom_id: JSON.stringify({ c: 'nsfw', src: 'images', type: 'send' }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        // label: "Outra Imagem",
                        emoji: "🔄",
                        custom_id: JSON.stringify({ c: 'nsfw', src: 'images', type: category }),
                        style: ButtonStyle.Primary
                    }
                ]
            }
        ]
    }).catch(() => { })

    async function getUrl() {

        if (["wallpaper"].includes(category))
            return await hmfull.Nekos.nsfw.wallpaper()

        if (["paizuri", "hanal", "kitsune", "tentacle"].includes(category))
            return await hmfull.NekoBot.nsfw[category]().catch(() => null)

        return await hmfull.HMtai.nsfw[category]().catch(() => null)
    }

}