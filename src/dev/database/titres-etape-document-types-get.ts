import '../../init'
import { titresEtapesGet } from '../../database/queries/titres-etapes'
import { userSuper } from '../../database/user-super'

const main = async () => {
  let etapes = await titresEtapesGet(
    {},
    {
      fields: {
        type: { id: {} },
        documents: { type: { id: {} } }
      }
    },
    userSuper
  )

  etapes = etapes.filter(d => d.documents?.length)

  const result = {} as { [typeId: string]: { [docTypeId: string]: number } }

  etapes.forEach(e => {
    if (!result[e.type!.nom]) {
      result[e.type!.nom] = {}
    }
    e.documents!.forEach(d => {
      if (!result[e.type!.nom][d.type!.nom]) {
        result[e.type!.nom][d.type!.nom] = 0
      }
      result[e.type!.nom][d.type!.nom]++
    })
  })

  console.info(result)
  process.exit(0)
}

main().catch(e => {
  console.error(e)

  process.exit(1)
})
