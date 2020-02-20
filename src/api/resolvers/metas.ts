import { IToken, IDomaine } from '../../types'
import { debug } from '../../config/index'

import restrictions from '../../database/cache/restrictions'

import {
  documentsTypesGet,
  domainesGet,
  devisesGet,
  geoSystemesGet,
  permissionsGet,
  permissionGet,
  referencesTypesGet,
  titresStatutsGet,
  titresTypesTypesGet,
  unitesGet,
  activitesTypesGet
} from '../../database/queries/metas'
import { utilisateurGet } from '../../database/queries/utilisateurs'

import { permissionsCheck } from './permissions/permissions-check'
import {
  titreTypePermissionCheck,
  domainePermissionCheck
} from './permissions/metas'

const npmPackage = require('../../../package.json')

const devises = async () => devisesGet()
const geoSystemes = async () => geoSystemesGet()
const unites = async () => unitesGet()
const documentsTypes = async () => documentsTypesGet()
const referencesTypes = async () => referencesTypesGet()
const permission = async ({ id }: { id: string }) => permissionGet(id)

const permissions = async (_: unknown, context: IToken) => {
  try {
    const user = context.user && (await utilisateurGet(context.user.id))
    if (!user || !permissionsCheck(user, ['super', 'admin'])) {
      return null
    }

    return permissionsGet({
      ordreMax: user.permission.ordre ? user.permission.ordre : 0
    })
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const domaines = async (_: unknown, context: IToken) => {
  try {
    const user = context.user && (await utilisateurGet(context.user.id))
    const domaines = await domainesGet()

    if (!permissionsCheck(user, ['super', 'admin'])) {
      return domaines.filter(
        domaine => !restrictions.domaines.find(d => d.domaineId === domaine.id)
      )
    }

    return domaines
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const utilisateurDomaines = async (_: unknown, context: IToken) => {
  try {
    if (!context.user) return []

    const user = await utilisateurGet(context.user.id)

    const isSuper = permissionsCheck(user, ['super'])
    const isAdmin = permissionsCheck(user, ['admin'])

    if (!isSuper && !isAdmin) return []

    let domaines = (await domainesGet()) as IDomaine[]

    if (isAdmin) {
      domaines = domaines.reduce((domaines: IDomaine[], domaine) => {
        const editable = domainePermissionCheck(user, domaine)

        if (editable) {
          if (domaine.titresTypes) {
            domaine.titresTypes = domaine.titresTypes.filter(tt =>
              titreTypePermissionCheck(user, tt.id)
            )
          }

          domaines.push(domaine)
        }

        return domaines
      }, [])
    }

    return domaines
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const types = async () => {
  try {
    const types = await titresTypesTypesGet()

    return types
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const statuts = async (_: unknown, context: IToken) => {
  try {
    let statuts = await titresStatutsGet()

    if (!context.user) {
      statuts = statuts.filter(
        statut => !restrictions.statutIds.find(d => d === statut.id)
      )
    }

    return statuts
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const version = () => {
  return npmPackage.version
}

const activitesTypes = async () => {
  try {
    const activitesTypes = await activitesTypesGet()

    // TODO: ne retourner que les types d'activités auxquels l'utilisateur a accès

    return activitesTypes
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

export {
  devises,
  documentsTypes,
  domaines,
  geoSystemes,
  permission,
  permissions,
  referencesTypes,
  statuts,
  types,
  unites,
  version,
  utilisateurDomaines,
  activitesTypes
}