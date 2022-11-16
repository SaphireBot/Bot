import {
    SaphireClient as client,
    Database
} from "../../../../classes/index.js"
import { ButtonStyle } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import infoSaphire from "../../../commands/functions/bot/profile.saphire.js"

export default async (interaction, { src: key, page }) => {

    const { message, user } = interaction
    if (message.interaction.user.id !== user.id) return

    if (typeof page !== "number" && key === "next")
        page = 1

    const Rody = (await client.users.fetch(Database.Names.Rody, { cache: true }))?.tag || "Rody"

    const pages = {
        0: infoSaphire,
        1: page1,
        2: page2,
        3: page3,
        4: page4
    }[page]

    return pages
        ? pages(interaction, true)
        : await interaction.reply({
            content: `${e.Deny} | Nenhuma página foi encontrada... Isso é muito estranho.`,
            ephemeral: true
        })

    async function page1() {

        const Pepy = (await client.users.fetch(Database.Names.Pepy, { cache: true }))?.tag || "Pepy"

        return await interaction.update({
            embeds: [{
                color: client.blue,
                title: `🖌️ ${client.user.username}'s Fotos de Perfil - 2/5`,
                description: `Com o passar dos dias, a divisão de Designer da Saphire Project foi fundada, com o foco da criação de todo o foco visual, como o perfil, banners, imagens, emoji, etc, etc e etc...\n \nAssumindo esta divisão, o ${Pepy} criou o primeiro rosto dela, do zero. Sem base nenhuma, seguindo o estilo anime.\n \nE como resultado, chegamos a 2° imagem de perfil.`,
                fields: [
                    {
                        name: "📝 Comentários",
                        value: `> *"Como o primeiro visual autêntico da ${client.user.username}, nós adotamos o laço azul como uma marca original que seguiria todos os visuais dela. Fizemos uma lei interna, onde todas as próximas fotos de perfil e emojis deveria portar o laço azul, no pescoço, pulso ou cabelo."*\n> ***~ ${Rody}, Saphire Project's Owner***\n \n> *"Texto do Pepy"*\n> ***~ ${Pepy}, Saphire Project's Head Designer***`
                    }
                ],
                image: {
                    url: "https://media.discordapp.net/attachments/1029158072926609520/1029160526204379267/Saphire_Icon.png?width=468&height=473"
                }
            }],
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: "Anterior",
                        custom_id: JSON.stringify({ c: "saphire", src: "previous", page: 0 }),
                        emoji: e.saphireLeft,
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: "Próximo",
                        custom_id: JSON.stringify({ c: "saphire", src: "next", page: 2 }),
                        emoji: e.saphireRight,
                        style: ButtonStyle.Primary
                    }
                ]
            }]
        }).catch(() => { })
    }

    async function page2() {

        const Pepy = (await client.users.fetch(Database.Names.Pepy, { cache: true }))?.tag || "Pepy"

        return await interaction.update({
            embeds: [{
                color: client.blue,
                title: `🖌️ ${client.user.username}'s Fotos de Perfil - 3/5`,
                description: `Com um visual original, um nome também foi necessário. Depois de pensar e pensar, o nome "Safira" chegou a um comum acordo. Tendo em mente a jóia safira.\n \nMas era muito comum e pulamos para o inglês, tendo assim, o nome "Sapphire". Porém, na época, o Discord barrou o nome por ser muito usado, então, removemos um "p". Chegando ao nome "Saphire"\nA pedra safira possue 2 cores, roxo/rosado e azul.\n \nPara uma identidade e personalidade ainda mais original, o ${Pepy} recriou novamente a ${client.user.username} na base das cores, idade e personalidade infantil. Ainda assim, no estilo anime.\n \nA Saphire precisava de um visual permanente. Uma menininha loira, de olhos azul com um uniforme escolar. Justamente por sua idade. Tendo como o azul/roxo/rosa da safira presente em toda a imagem. Esse foi o acordo da divisão de Designer com a divisão de Administradores.\n \nO laço/gravata azul permanece como um símbolo da sua criação, uma característica original.\n \nComo o ${Pepy} introduziu a Lua na cor roxa safira e na época o nome Moon (lua) estava sendo cogitado para entrar de sobrenome, essa foi a deixa para a entrada do nome "Moon", chegando ao nome permanente, ${client.user.username}.\n \nTendo como resultado, a 3° foto de perfil oficial`,
                fields: [
                    {
                        name: "📝 Comentários",
                        value: `> *"Eu gostei bastante do resultado entregue pelo o ${Pepy} e a equipe de Designer. Um desenho único com um tom antigo de anime deu um visual único pra Saphire. E o laço em forma de gravata ficou sensacional."*\n> ***~ ${Rody}, Saphire Project's Owner***\n \n> *"Texto do Pepy"*\n> ***~ ${Pepy}, Saphire Project's Head Designer***`
                    }
                ],
                image: {
                    url: "https://media.discordapp.net/attachments/1029158072926609520/1029161888359133225/06f6cec5f90a03fd33c68884c77f43c6.png?width=484&height=484"
                }
            }],
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: "Anterior",
                        custom_id: JSON.stringify({ c: "saphire", src: "previous", page: 1 }),
                        emoji: e.saphireLeft,
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: "Próximo",
                        custom_id: JSON.stringify({ c: "saphire", src: "next", page: 3 }),
                        emoji: e.saphireRight,
                        style: ButtonStyle.Primary
                    }
                ]
            }]
        }).catch(() => { })
    }

    async function page3() {

        const Pepy = (await client.users.fetch(Database.Names.Pepy, { cache: true }))?.tag || "Pepy"
        const Yafyr = (await client.users.fetch(Database.Names.Yafyr, { cache: true }))?.tag || "Yafyr"

        return await interaction.update({
            embeds: [
                {
                    color: client.blue,
                    title: `🖌️ ${client.user.username}'s Fotos de Perfil - 4/5`,
                    description: `A ${client.user.username} foi crescendo e crescendo e um detalhe foi notado. Ela estava ficando muito infantil para o público do Discord. Tanto para as pessoas, quanto para os comandos dela. Ela começou a precisar de um novo designer.\n \nComo o ${Pepy} estava muito ocupado, fui atrás de um designer capaz de atender os requisitos para tal façanha. Depois de algumas horas, cheguei ao criador das artes de perfil da bot Loritta, o ${Yafyr}\nDepois de muita conversa, acordos e ideias de vários membros da equipe da Saphire, o designer final foi montado.\nAs mesmas características, porém, dar uma ênfase maior na lua e mudar o rosto para uma versão mais "agressiva".\n \nTornamos a lua o seu poder.\nMudamos o uniforme para uma edição Premium.\nDemos um ar de arrogância e orgulho.\nE claro, mantemos o lacinho azul.\n \nDepois de mais ou menos 2 semanas, algumas alterações, muita conversa e acompanhamento. O ${Yafyr} entregou a arte. Deixamos tudo nas mãos dele e ele fez mais do que nós esperávamos.\nChegando assim, a 4° foto de perfil`,
                    fields: [
                        {
                            name: "📝 Comentários",
                            value: `> *"Saphire séria... Foi até divertido fazer esse desenho, bem diferente do comum para mim, não é todo dia que alguém me pede pra desenhar algo nesse estilo, então eu tive a liberdade de experimentar bastante com esse desenho algumas ideias que eu já tinha há um tempo."*\n> ***~ ${Yafyr}, Freelancer Artist & Saphire Project's Designer Member***\n \n> *"Esse foi um projeto muito bom. O talento do ${Yafyr} é surpreendente e superou as minhas expectativas."*\n> ***~ ${Rody}, Saphire Project's Owner***`
                        }
                    ],
                    image: {
                        url: "https://media.discordapp.net/attachments/1029158072926609520/1029165530646597632/saphire.png?width=334&height=472"
                    }
                },
                {
                    color: client.blue,
                    title: "Adptação para foto de perfil",
                    image: {
                        url: "https://media.discordapp.net/attachments/1029158072926609520/1029165787333787669/saphire-avatar.png?width=473&height=473"
                    }
                }
            ],
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: "Anterior",
                        custom_id: JSON.stringify({ c: "saphire", src: "previous", page: 2 }),
                        emoji: e.saphireLeft,
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: "Próximo",
                        custom_id: JSON.stringify({ c: "saphire", src: "next", page: 4 }),
                        emoji: e.saphireRight,
                        style: ButtonStyle.Primary
                    }
                ]
            }]
        }).catch(() => { })
    }

    async function page4() {

        const Yafyr = (await client.users.fetch(Database.Names.Yafyr, { cache: true }))?.tag || "Yafyr"

        return await interaction.update({
            embeds: [
                {
                    color: client.blue,
                    title: `🖌️ ${client.user.username}'s Fotos de Perfil - 5/5`,
                    url: "https://twitter.com/yafyr/status/1587930899764899840",
                    description: `Após muitas pessoas falarem que a ${client.user.username} estava com uma carinha de perversa, um remake fofo foi idealizado.\n \nNesta vez, a única coisa que escolhemos foi o formato do desenho, "A Saphire abraçando a lua em formato de almofada".\n \nO ${Yafyr} teve apenas essa informação e o resto ficou a critério de suas habilidades e criatividade.\n \nAqui ficou claro que suas habilidades são praticamente infinitas e novamente, entregou mais do que esperado.\n \nE assim, chegamos a 5° (talvez última) foto de perfil da Saphire.`,
                    fields: [
                        {
                            name: "📝 Comentários",
                            value: `> *"Saphire fofa... Um belo contraste do último desenho, não que a gente não quisesse que a cara da Saphire no Discord fosse de uma vilã, mas nem todo mundo tem bom gosto, no mais, esse é outro desenho que eu gostei muito de fazer e em que tive bastante liberdade criativa."*\n> ***~ ${Yafyr}, Freelancer Artist & Saphire Project's Designer Member***\n \n> *"A ${client.user.username} ficou extremamente fofa e novamente eu fiquei muito feliz com o resultado."*\n> ***~ ${Rody}, Saphire Project's Owner***`
                        }
                    ],
                    image: {
                        url: "https://media.discordapp.net/attachments/1029158072926609520/1037489996321538098/saphire_almofada.png?width=669&height=473"
                    }
                },
                {
                    color: client.blue,
                    title: "Adptação para foto de perfil",
                    url: "https://twitter.com/yafyr/status/1587930899764899840",
                    description: `E claro, um recorte foi necessário para o enquadramento.\nVocê também pode conferir o post oficial no [Twitter](https://twitter.com/yafyr/status/1587930899764899840) do ${Yafyr}`,
                    image: {
                        url: "https://media.discordapp.net/attachments/1029158072926609520/1037490102248685599/avatar_2.0.png?width=473&height=473"
                    }
                }
            ],
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: "Anterior",
                        custom_id: JSON.stringify({ c: "saphire", src: "previous", page: 3 }),
                        emoji: e.saphireLeft,
                        style: ButtonStyle.Primary
                    }
                ]
            }]
        }).catch(() => { })
    }

}