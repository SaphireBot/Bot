import * as fs from 'fs'
import { Database, Modals, SaphireClient as client } from '../../classes/index.js'
import { Config as config } from '../../util/Constants.js'

export default class Base {
    constructor() {
        this.emojis = JSON.parse(fs.readFileSync('./src/JSON/emojis.json')) // Ideia por: Jack - 904891162362519562
        this.modals = Modals.modals
        this.client = client
        this.Database = Database
        this.config = config
    }
}