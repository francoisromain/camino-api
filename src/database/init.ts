import { metasInit } from './cache/metas'
import { geoConvertInit } from '../tools/geo-convert'
import { globalesInit } from './cache/globales'
import { geoSystemesInit } from './cache/geo-systemes'

const init = async () => {
  await metasInit()
  // on initialise le cache des géosystèmes en premier
  // car geoConvert les utilise pour son initialisation
  await geoSystemesInit()
  await geoConvertInit()
  await globalesInit()
}

export default init
