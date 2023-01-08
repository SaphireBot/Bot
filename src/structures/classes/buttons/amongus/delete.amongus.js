import { Database } from "../../../../classes/index.js"

export default async (partyId = '0') => await Database.Cache.AmongUs.delete(partyId)