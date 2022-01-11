// cf [relation between quality and dB](https://www.netspotapp.com/what-is-rssi-level.html)

export const percentageFromDB = db => 2 * (parseFloat(db) + 100)

export const dBFromPercentage = quality => parseFloat(quality) / 2 - 100
