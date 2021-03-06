import { IToken, ITitreTravaux } from '../../../types'
import {
  titreTravauxGet,
  titreTravauxCreate,
  titreTravauxUpdate,
  titreTravauxDelete
} from '../../../database/queries/titres-travaux'
import fieldsBuild from './_fields-build'
import { titreGet } from '../../../database/queries/titres'
import { debug } from '../../../config/index'
import { titreFormat } from '../../_format/titres'
import titreTravauxUpdateTask from '../../../business/titre-travaux-update'

import { GraphQLResolveInfo } from 'graphql'
import { titreEtapesOrActivitesFichiersDelete } from './_titre-document'
import { userGet } from '../../../database/queries/utilisateurs'

const travauxCreer = async (
  { travaux }: { travaux: ITitreTravaux },
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const user = await userGet(context.user?.id)

    const titre = await titreGet(travaux.titreId, { fields: {} }, user)

    if (!titre) throw new Error("le titre n'existe pas")

    if (!titre.travauxCreation) throw new Error('droits insuffisants')

    const travauxUpdated = await titreTravauxCreate(
      travaux,
      {
        fields: { id: {} }
      },
      user
    )

    const titreUpdatedId = await titreTravauxUpdateTask(travauxUpdated.titreId)

    const fields = fieldsBuild(info)

    const titreUpdated = await titreGet(titreUpdatedId, { fields }, user)

    return titreUpdated && titreFormat(titreUpdated)
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const travauxModifier = async (
  { travaux }: { travaux: ITitreTravaux },
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const user = await userGet(context.user?.id)

    const oldTitreTravaux = await titreTravauxGet(
      travaux.titreId,
      { fields: { id: {} } },
      user
    )

    if (!oldTitreTravaux) throw new Error("Les travaux n'existent pas")

    if (!oldTitreTravaux.modification) throw new Error('droits insuffisants')

    const titre = await titreGet(travaux.titreId, { fields: { id: {} } }, user)

    if (!titre) throw new Error("le titre n'existe pas")

    const travauxUpdated = await titreTravauxUpdate(travaux.id, travaux, {
      fields: { id: {} }
    })

    const titreUpdatedId = await titreTravauxUpdateTask(travauxUpdated.titreId)

    const fields = fieldsBuild(info)

    const titreUpdated = await titreGet(titreUpdatedId, { fields }, user)

    return titreUpdated && titreFormat(titreUpdated)
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const travauxSupprimer = async (
  { id }: { id: string },
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const user = await userGet(context.user?.id)

    const oldTitreTravaux = await titreTravauxGet(
      id,
      { fields: { id: {} } },
      user
    )

    if (!oldTitreTravaux) throw new Error("Les travaux n'existent pas")

    if (!oldTitreTravaux.suppression) throw new Error('droits insuffisants')

    const travauxOld = await titreTravauxGet(id, {
      fields: { etapes: { documents: { type: { id: {} } } } }
    })
    if (!travauxOld) throw new Error("la démarche n'existe pas")

    await titreTravauxDelete(id)

    await titreEtapesOrActivitesFichiersDelete(travauxOld.etapes)

    const titreUpdatedId = await titreTravauxUpdateTask(travauxOld.titreId)

    const fields = fieldsBuild(info)

    const titreUpdated = await titreGet(titreUpdatedId, { fields }, user)

    return titreUpdated && titreFormat(titreUpdated)
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

export { travauxCreer, travauxModifier, travauxSupprimer }
