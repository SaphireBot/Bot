
/**
 * ESSE SISTEMA DE PROTOTYPES FOI UMA GAMBIARRA FEITA POR PURA CURIOSIDADE PELOS SEGUINTES MEMBROS:
 * IDEALIZADOR DOS PROTOTYPES: JackSkelt#3063 - 904891162362519562
 * ESCRITA & CONSTRUÇÃO: Rody#1000 - 451619591320371213 / Gorniaky#2023  - 395669252121821227
 * IDEALIZADOR DO "clientPermissions": Seeker#2083 - 750714601284304986
 */
import { readdirSync } from 'fs'
const files = readdirSync('./src/functions/global/prototypes').filter(fileName => fileName.endsWith('.js'))
for (const file of files) import(`./prototypes/${file}`)