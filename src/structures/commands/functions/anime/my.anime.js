// import {
//     SaphireClient as client,
//     Database
// } from "../../../../classes/index.js"
// import { Emojis as e } from "../../../../util/util.js"

// export default async interaction => {

//     const { user } = interaction
//     const allAnimes = await Database.animeIndications() || []

//     if (!allAnimes || !allAnimes.length)
//         return await interaction.reply({
//             content: `${e.Deny} | Você não tem nenhuma indicação enviada/aprovada.`,
//             ephemeral: true
//         })

//     const myAnimes = allAnimes.filter(anime => anime.authorId === user.id)

//     if (!myAnimes || !myAnimes.length)
//         return await interaction.reply({
//             content: `${e.Deny} | Você não tem nenhuma indicação enviada/aprovada.`,
//             ephemeral: true
//         })

//     const embeds = EmbedGenerator(myAnimes)

//     function EmbedGenerator(myAnimes) {

//         let amount = 10
//         let page = 1
//         let embeds = []
//         let length = array.length / 10 <= 1 ? 1 : parseInt((array.length / 10) + 1)

//         for (let i = 0; i < array.length; i += 10) {

//             let current = array.slice(i, amount)
//             let description = current.map(data => 'formatString').join('\n')
//             let pageCount = length > 1 ? `/` : ''

//             embeds.push({
//                 color: String,
//                 title: String,
//                 url: String,
//                 author: {
//                     name: String,
//                     icon_url: String,
//                     url: String,
//                 },
//                 description: String,
//                 thumbnail: {
//                     url: String,
//                 },
//                 fields: [ // Max: 25
//                     {
//                         name: String,
//                         value: String,
//                         inline: Boolean
//                     }
//                 ],
//                 image: {
//                     url: String,
//                 },
//                 timestamp: new Date(),
//                 footer: {
//                     text: String,
//                     icon_url: String,
//                 }
//             })

//             page++
//             amount += 10

//         }

//         return embeds
//     }

// }