import '../../init'
import fileCreate from '..//tools/file-create'

import { inseeSirenGet, inseeSiretGet } from '..//tools/api-insee'

const siret1 = '57219916400045'
const siret2 = '48486050700017'

const entreprises = ['c', 'f', 'g', 'h', 'm', 'r', 's', 'w']
  .reduce((r, d) => {
    r.push(...require(`../../sources/entreprises-titres-${d}`))

    return r
  }, [])
  .filter(e => e.legal_siren)
  .map(e => e.legal_siren)
  .slice(0, 19)

console.info(entreprises.length)

async function main() {
  const test = true
  if (test) {
    const result = await inseeSirenGet(entreprises)

    console.info(result.length)

    await fileCreate(
      'tmp/test-entreprises.json',
      JSON.stringify(result, null, 2)
    )
  }

  if (!test) {
    const etablissements = await inseeSiretGet([siret1, siret2])

    console.info(etablissements)

    await fileCreate(
      'test-etablissements.json',
      JSON.stringify(etablissements, null, 2)
    )
  }

  process.exit()
}

main()
