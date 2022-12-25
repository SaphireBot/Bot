import * as fs from 'fs'
import { Database, Modals, SaphireClient as client } from '../../classes/index.js'
import * as Constants from '../../util/Constants.js'

export default class Base {
    constructor() {
        this.emojis = JSON.parse(fs.readFileSync('./JSON/emojis.json')) // Ideia por: Jack - 904891162362519562
        this.modals = Modals.modals
        this.client = client
        this.Database = Database
        this.config = Constants.Config
        this.Constants = Constants
    }
}