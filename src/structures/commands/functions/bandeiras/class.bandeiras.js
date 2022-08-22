import { Flags, Emojis as e } from "../../../../util/util.js"
import { Base } from '../../../../classes/index.js'

export default class FlagGame extends Base {
    constructor(interaction) {
        super()
        this.interaction = interaction
        this.guild = interaction.guild
        this.channel = interaction.channel
        this.flags = [...Flags]
    }

    game() {
        this.msg = await this.interaction.reply({
            content: `${e.Loading} | Construindo novo jogo...`,
            fetchReply: true
        })
    }

    getFlag() {

        const flag = this.flags.random()
        

    }

}