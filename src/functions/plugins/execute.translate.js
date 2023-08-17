// import translate from '@iamtraction/google-translate'
// import { Languages } from '../../util/Constants.js'

// export default async ({ flag, targetMessage }) => {

//     const formatedLocale = flag.replace('flag_', '')
//     return console.log(formatedLocale)
//     let text = targetMessage.content

//     if (!text)
//         return await interaction.reply({
//             content: `${e.Deny} | Não há nenhum texto para traduzir nesta mensagem.`,
//             ephemeral: true
//         })

//     if (text.length > 1013)
//         text = `${text.slice(0, 1010)}...`

//     const Embed = {
//         color: 0x4295FB,
//         author: { name: 'Google Tradutor', iconURL: 'https://media.discordapp.net/attachments/893361065084198954/1002389116329144440/unknown.png?width=484&height=484' },
//         fields: [{
//             name: 'Texto',
//             value: `\`\`\`txt\n${text}\n\`\`\``
//         }]
//     }

//     await interaction.deferReply({})

//     return translate(text, { to: formatedLocale })
//         .then(async res => {

//             if (res.text.length > 1013)
//                 res.text = `${res.text.slice(0, 1010)}...`

//             Embed.fields[1] = {
//                 name: 'Tradução',
//                 value: `\`\`\`txt\n${res.text}\n\`\`\``
//             }

//             Embed.footer = { text: `Traduzido de ${Languages[res.from.language.iso] || 'WTF?'} para ${Languages[formatedLocale]}` }

//             return await interaction.editReply({ embeds: [Embed] })

//         })
//         .catch(async err => {

//             let errText = `${err}`

//             if (!errText.length > 1013)
//                 errText = `${errText.slice(0, 1010)}...`

//             Embed.color = client.red
//             Embed.fields[1] = {
//                 name: 'Erro',
//                 value: `\`\`\`txt\n${errText}\n\`\`\``
//             }

//             return await interaction.editReply({ embeds: [Embed] })
//         })
// }
