import { IToken, IUtilisateur } from '../../types'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import * as cryptoRandomString from 'crypto-random-string'

import init from '../../server/init'

import { debug } from '../../config/index'
import { emailSend } from '../../tools/emails-send'

import {
  utilisateurGet,
  utilisateursGet,
  utilisateurCreate,
  utilisateurUpdate,
  utilisateurByEmailGet
} from '../../database/queries/utilisateurs'

import globales from '../../database/cache/globales'

import utilisateurUpdationValidate from '../../business/utilisateur-updation-validate'

import { utilisateurRowUpdate } from '../../tools/export/utilisateur'

import { permissionsCheck } from './permissions/permissions-check'

import {
  emailCheck,
  utilisateurEditionCheck,
  utilisateurTestCheck
} from './permissions/utilisateur'

import { utilisateursFormat, utilisateurFormat } from './format/utilisateurs'
import { userFormat } from './format/users'

const userIdGenerate = async (): Promise<string> => {
  const id = cryptoRandomString({ length: 6 })
  const utilisateurWithTheSameId = await utilisateurGet(id)
  if (utilisateurWithTheSameId) {
    return userIdGenerate()
  }

  return id
}

const utilisateur = async ({ id }: { id: string }, context: IToken) => {
  try {
    const utilisateur = await utilisateurGet(id)

    const user = context.user && (await utilisateurGet(context.user.id))

    return utilisateurFormat(user, utilisateur)
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const utilisateurs = async (
  {
    entrepriseIds,
    administrationIds,
    permissionIds,
    noms
  }: {
    entrepriseIds: string[]
    administrationIds: string[]
    permissionIds: string[]
    noms: string[]
  },
  context: IToken
) => {
  try {
    const utilisateurs = await utilisateursGet({
      noms,
      entrepriseIds,
      administrationIds,
      permissionIds
    })

    const user = context.user && (await utilisateurGet(context.user.id))

    return utilisateursFormat(user, utilisateurs)
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const moi = async (_: unknown, context: IToken) => {
  try {
    // vérifie que la base de données était remplie au démarrage du serveur
    if (!globales.chargement) {
      await init()
    }

    const user = context.user && (await utilisateurGet(context.user.id))

    return userFormat(user)
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const utilisateurTokenCreer = async ({
  email,
  motDePasse
}: {
  email: string
  motDePasse: string
}) => {
  try {
    email = email.toLowerCase()

    if (!emailCheck(email)) {
      throw new Error('adresse email invalide')
    }

    const utilisateur = await utilisateurByEmailGet(email)

    if (!utilisateur) {
      throw new Error('aucun utilisateur enregistré avec cette adresse email')
    }

    const valid = bcrypt.compareSync(motDePasse, utilisateur.motDePasse!)

    if (!valid) {
      throw new Error('mot de passe incorrect')
    }

    const token = userTokenCreate(utilisateur)

    return { token, utilisateur: userFormat(utilisateur) }
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const utilisateurCreer = async (
  { utilisateur }: { utilisateur: IUtilisateur },
  context: IToken
) => {
  try {
    if (!context.user) {
      throw new Error('droits insuffisants pour créer un utilisateur')
    }

    const user = context.user.id
      ? await utilisateurGet(context.user.id)
      : undefined

    utilisateur.email = utilisateur.email!.toLowerCase()

    const errors = utilisateurEditionCheck(utilisateur)

    if (
      !permissionsCheck(user, ['super']) &&
      utilisateur.permissionId === 'super'
    ) {
      errors.push('droits insuffisants créer un super utilisateur')
    }

    if (
      !permissionsCheck(user, ['super', 'admin']) &&
      context.user.email !== utilisateur.email
    ) {
      errors.push('droits insuffisants pour créer un utilisateur')
    }

    if (utilisateur.motDePasse!.length < 8) {
      errors.push('le mot de passe doit contenir au moins 8 caractères')
    }

    const utilisateurWithTheSameEmail = await utilisateurByEmailGet(
      utilisateur.email!
    )

    if (utilisateurWithTheSameEmail) {
      errors.push('un utilisateur avec cet email existe déjà')
    }

    if (errors.length) {
      throw new Error(errors.join(', '))
    }

    if (!user || !permissionsCheck(user, ['super', 'admin'])) {
      utilisateur.permissionId = 'defaut'
    }

    if (!permissionsCheck(utilisateur, ['admin', 'editeur', 'lecteur'])) {
      utilisateur.administrations = []
    }

    if (!permissionsCheck(utilisateur, ['entreprise'])) {
      utilisateur.entreprises = []
    }

    utilisateur.motDePasse = bcrypt.hashSync(utilisateur.motDePasse!, 10)
    utilisateur.id = await userIdGenerate()

    const utilisateurUpdated = await utilisateurCreate(utilisateur)

    await utilisateurRowUpdate(utilisateurUpdated)

    return utilisateurUpdated
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const utilisateurCreationEmailEnvoyer = async ({
  email
}: {
  email: string
}) => {
  try {
    email = email.toLowerCase()

    if (!emailCheck(email)) {
      throw new Error('adresse email invalide')
    }

    const utilisateur = await utilisateurByEmailGet(email)

    if (utilisateur) {
      throw new Error(
        'un utilisateur est déjà enregistré avec cette adresse email'
      )
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET!)

    const url = `${
      process.env.UI_URL
    }/creation-de-compte?token=${token}&email=${encodeURIComponent(email)}`

    const subject = `Création de votre compte utilisateur`
    const html = `<p>Pour créer votre compte, <a href="${url}">cliquez ici</a>.</p>`

    if (utilisateurTestCheck(email)) {
      return url
    }

    emailSend(email, subject, html)

    return 'email envoyé'
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const utilisateurModifier = async (
  { utilisateur }: { utilisateur: IUtilisateur },
  context: IToken
) => {
  try {
    const user = context.user && (await utilisateurGet(context.user.id))

    utilisateur.email = utilisateur.email!.toLowerCase()

    const isSuper = permissionsCheck(user, ['super'])
    const isAdmin = permissionsCheck(user, ['admin'])

    if (!user || (!isSuper && !isAdmin && user.id !== utilisateur.id)) {
      throw new Error('droits insuffisants pour modifier cet utilisateur')
    }

    const errors = utilisateurEditionCheck(utilisateur)

    if (!isSuper && permissionsCheck(utilisateur, ['super'])) {
      errors.push(
        'droits insuffisants pour affecter ces permissions à cet utilisateur'
      )
    }

    if (!isSuper && !isAdmin && user.email !== utilisateur.email) {
      errors.push(
        "droits insuffisants pour modifier l'adresse email de cet utilisateur"
      )
    }

    if (!isSuper) {
      const errorsValidate = await utilisateurUpdationValidate(
        user,
        utilisateur,
        isAdmin
      )

      if (errorsValidate.length) {
        errors.push(...errorsValidate)
      }
    }

    if (errors.length) {
      throw new Error(errors.join(', '))
    }

    if (!permissionsCheck(utilisateur, ['admin', 'editeur', 'lecteur'])) {
      utilisateur.administrations = []
    }

    if (!permissionsCheck(utilisateur, ['entreprise'])) {
      utilisateur.entreprises = []
    }

    const utilisateurUpdated = await utilisateurUpdate(utilisateur)

    await utilisateurRowUpdate(utilisateurUpdated)

    return utilisateurFormat(user, utilisateurUpdated)
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const utilisateurSupprimer = async (
  { id }: { id: string },
  context: IToken
) => {
  try {
    const user = context.user && (await utilisateurGet(context.user.id))

    if (
      !user ||
      (!permissionsCheck(user, ['super', 'admin']) && user.id !== id)
    ) {
      throw new Error('droits insuffisants pour supprimer cet utilisateur')
    }

    const utilisateur = await utilisateurGet(id)

    utilisateur.email = undefined
    utilisateur.motDePasse = 'suppression'
    utilisateur.telephoneFixe = undefined
    utilisateur.telephoneMobile = undefined
    utilisateur.permissionId = 'defaut'
    utilisateur.entreprises = []
    utilisateur.administrations = []

    const utilisateurUpdated = await utilisateurUpdate(utilisateur)

    await utilisateurRowUpdate(utilisateurUpdated)

    return utilisateurUpdated
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const utilisateurMotDePasseModifier = async (
  {
    id,
    motDePasse,
    motDePasseNouveau1,
    motDePasseNouveau2
  }: {
    id: string
    motDePasse: string
    motDePasseNouveau1: string
    motDePasseNouveau2: string
  },
  context: IToken
) => {
  try {
    const user = context.user && (await utilisateurGet(context.user.id))

    if (
      !user ||
      (!permissionsCheck(user, ['super', 'admin']) && user.id !== id)
    ) {
      throw new Error('droits insuffisants')
    }

    if (motDePasseNouveau1.length < 8) {
      throw new Error('le mot de passe doit contenir au moins 8 caractères')
    }

    if (motDePasseNouveau1 !== motDePasseNouveau2) {
      throw new Error(
        'le nouveau mot de passe et la vérification sont différents'
      )
    }

    const utilisateur = await utilisateurGet(id)

    if (!utilisateur) {
      throw new Error('aucun utilisateur enregistré avec cet id')
    }

    if (!permissionsCheck(user, ['super'])) {
      const valid = bcrypt.compareSync(motDePasse, utilisateur.motDePasse!)

      if (!valid) {
        throw new Error('mot de passe incorrect')
      }
    }

    utilisateur.motDePasse = bcrypt.hashSync(motDePasseNouveau1, 10)

    const utilisateurUpdated = utilisateurUpdate({
      id,
      motDePasse: utilisateur.motDePasse
    } as IUtilisateur)

    await utilisateurRowUpdate(utilisateurUpdated)

    return utilisateurUpdated
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

// envoie l'email avec un lien vers un formulaire de ré-init
const utilisateurMotDePasseEmailEnvoyer = async ({
  email
}: {
  email: string
}) => {
  try {
    if (!emailCheck(email)) {
      throw new Error('adresse email invalide')
    }

    const utilisateur = await utilisateurByEmailGet(email)

    if (!utilisateur) {
      throw new Error('aucun utilisateur enregistré avec cette adresse email')
    }

    const token = jwt.sign({ id: utilisateur.id }, process.env.JWT_SECRET!)

    const url = `${process.env.UI_URL}/mot-de-passe?token=${token}`

    const subject = `Initialisation de votre mot de passe`
    const html = `<p>Pour initialiser votre mot de passe, <a href="${url}">cliquez ici</a> (lien valable 15 minutes).</p>`

    emailSend(email, subject, html)

    return 'email envoyé'
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

// formulaire de ré-init du mot de passe
const utilisateurMotDePasseInitialiser = async (
  { motDePasse1, motDePasse2 }: { motDePasse1: string; motDePasse2: string },
  context: IToken
) => {
  try {
    if (!context.user || !context.user.id) {
      throw new Error('aucun utilisateur identifié')
    }

    const now = Math.round(new Date().getTime() / 1000)
    const delay = 60 * 15 // 15 minutes

    if (now - context.user.iat! > delay) {
      throw new Error('délai expiré')
    }

    if (motDePasse1.length < 8) {
      throw new Error('le mot de passe doit contenir au moins 8 caractères')
    }

    if (motDePasse1 !== motDePasse2) {
      throw new Error(
        'le nouveau mot de passe et la vérification sont différents'
      )
    }

    const utilisateur = await utilisateurGet(context.user.id)

    if (!utilisateur) {
      throw new Error('aucun utilisateur enregistré avec cet id')
    }

    utilisateur.motDePasse = bcrypt.hashSync(motDePasse1, 10)

    const utilisateurUpdated = await utilisateurUpdate({
      id: context.user.id,
      motDePasse: utilisateur.motDePasse
    } as IUtilisateur)

    await utilisateurRowUpdate(utilisateurUpdated)

    const token = userTokenCreate(utilisateurUpdated)

    return { token, utilisateur: userFormat(utilisateurUpdated) }
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const userTokenCreate = ({ id, email }: IUtilisateur) =>
  jwt.sign({ id, email }, process.env.JWT_SECRET!)

export {
  utilisateur,
  utilisateurs,
  moi,
  utilisateurTokenCreer,
  utilisateurCreer,
  utilisateurCreationEmailEnvoyer,
  utilisateurModifier,
  utilisateurSupprimer,
  utilisateurMotDePasseModifier,
  utilisateurMotDePasseEmailEnvoyer,
  utilisateurMotDePasseInitialiser
}