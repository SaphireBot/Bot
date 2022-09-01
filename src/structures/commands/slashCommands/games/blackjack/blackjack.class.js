import { Base } from '../../../../../classes/index.js'
import { Emojis as e } from '../../../../../util/util.js'
import * as fs from 'fs'

export default class Blackjack extends Base {
    constructor(interaction) {
        super()
        this.interaction = interaction
        this.options = interaction.options
    }

    async validateOptions() {

        const option = this.options.getSubcommand()

        switch (option) {
            case 'solo': import('./solo/index.js').then(solo => solo.default(this)); break;
            case 'multiplayer': import('./multiplayer/multiplayer.blackjack.js').then(multiplayer => multiplayer.default(this)); break;
            case 'refund': import('./refund/index.js').then(refund => refund.default(this)); break;

            default:
                await this.interaction.reply({
                    content: `${e.Deny} | Subcomando não encontrado.`,
                    ephemeral: true
                })
                break;
        }

        return
    }

    get BlackJackEmojis() {
        return JSON.parse(fs.readFileSync('./src/structures/commands/slashCommands/games/blackjack/emojis.json'))
    }
}