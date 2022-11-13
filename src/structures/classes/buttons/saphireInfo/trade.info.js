import {
    SaphireClient as client,
    Database
} from "../../../../classes/index.js"
import { ButtonStyle } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import infoSaphire from "../../../commands/functions/bot/info.saphire.js"

export default async (interaction, { src: key, page }) => {

    if (typeof page !== "number" && key === "next")
        page = 1

    const pages = {
        0: infoSaphire,
        1: page1
    }[page]

    return pages
        ? pages(interaction, true)
        : await interaction.reply({
            content: `${e.Deny} | Nenhuma página foi encontrada... Isso é muito estranho.`,
            ephemeral: true
        })

    async function page1() {

        const Rody = (await client.users.fetch(Database.Names.Rody, { cache: true }))?.tag || "Rody"
        const Pepy = (await client.users.fetch(Database.Names.Pepy, { cache: true }))?.tag || "Pepy"

        return await interaction.reply({
            embeds: [{
                color: client.blue,
                title: `🖌️ ${client.user.username}'s Fotos de Perfil - 2/5`,
                description: `Com o passar dos dias, a divisão de Designer da Saphire Project foi fundada, com o foco da criação de todo o foco visual, como o perfil, banners, imagens, emoji, etc, etc e etc...\n \nAssumindo esta divisão, o ${Pepy} criou o primeiro rosto dela, do zero. Sem base nenhuma, seguindo o estilo anime.\n \nE como resultado, chegamos a 2° imagem de perfil.`,
                fields: [
                    {
                        name: "📝 Comentários",
                        value: `> *"Como o primeiro visual autêntico da ${client.user.username}, nós adotamos o laço azul como uma marca original que seguiria todos os visuais dela. Fizemos uma lei interna, onde todas as próximas fotos de perfil e emojis deveria portar o laço azul, no pescoço, pulso ou cabelo."*\n> ***~ ${Rody}, Saphire Project's Owner***\n \n> *"Texto do Pepy"*\n> ***~${Pepy}, Saphire Project's Head Designer***`
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
                        custom_id: 'disabled',
                        custom_id: JSON.stringify({ c: "saphire", src: "next", page: 0 }),
                        emoji: e.saphireLeft,
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: "Próximo",
                        custom_id: JSON.stringify({ c: "saphire", src: "next", page: 2 }),
                        emoji: e.saphireRight,
                        style: ButtonStyle.Primary,
                        disabled: true
                    }
                ]
            }]
        })
    }

}