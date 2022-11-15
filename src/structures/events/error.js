import { SaphireClient as client } from '../../classes/index.js'

client.on('error', error => console.log(`DISCORD LOGS => ` + error))