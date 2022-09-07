// import { Modals } from '../../classes/index.js'

// class SelectMenuInteraction extends Modals {
//     constructor(interaction) {
//         super()
//         this.interaction = interaction
//         this.customId = interaction.customId
//         this.values = interaction.values
//         this.message = interaction.message
//         this.user = interaction.user
//         this.guild = interaction.guild
//         this.channel = interaction.channel
//         this.value = this.values[0]
//     }

//     filterAndChooseFunction() {

//         switch (this.value) {
//             case 'reportTransactions': this.reportTransactions(); break;
//         }

//         return
//     }

//     reportTransactions = async () => await this.interaction.showModal(this.transactionsReport)

// }

// module.exports = SelectMenuInteraction
