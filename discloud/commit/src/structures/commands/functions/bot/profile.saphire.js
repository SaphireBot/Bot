import { ButtonStyle } from "discord.js"
import {
    SaphireClient as client,
    Database
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, toUpdate = false) => {

    const Rody = (await client.users.fetch(Database.Names.Rody, { cache: true }))?.tag || "Rody"

    const replyData = {
        embeds: [{
            color: client.blue,
            title: `🖌️ ${client.user.username}'s Fotos de Perfil - 1/5`,
            description: "A primeira foto de perfil da Saphire foi a [Asuna](https://swordartonline.fandom.com/pt-br/wiki/Yuuki_Asuna). Uma personagem feminina do anime [Sword Art Online](https://www.crunchyroll.com/pt-br/series/GR49G9VP6/sword-art-online).\n \nO nome da Saphire também era Asuna nos primórdios da criação dela.\n \nE como resultado, chegamos a 1° imagem de perfil.",
            fields: [
                {
                    name: "📝 Comentários",
                    value: `> *\"A Asuna é uma das minhas personagens favoritas, depois da [Anya](https://spy-x-family.fandom.com/pt-br/wiki/Anya_Forger) é claro! Não tinha motivos para não ser ela.\"*\n> ***~ ${Rody}, Saphire Project's Owner***`
                }
            ],
            image: {
                url: "https://media.discordapp.net/attachments/1029158072926609520/1029159868894040094/f9664857e5afebe44caf651b12cc5921.jpg?width=473&height=473"
            }
        }],
        components: [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: "Próximo",
                    custom_id: JSON.stringify({ c: "saphire", src: "next", page: 1 }),
                    emoji: e.saphireRight,
                    style: ButtonStyle.Primary
                }
            ]
        }]
    }

    return toUpdate
        ? await interaction.update(replyData)
        : await interaction.reply(replyData)

}