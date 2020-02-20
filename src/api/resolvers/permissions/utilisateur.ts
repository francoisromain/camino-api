import { IUtilisateur } from '../../../types'
import * as emailRegex from 'email-regex'

import { permissionsCheck } from './permissions-check'

const emailCheck = (email: string) => emailRegex({ exact: true }).test(email)

const permissionUtilisateurAdministrationCheck = (
  user: IUtilisateur,
  utilisateur: IUtilisateur
) =>
  !!(
    user.administrations &&
    user.administrations.some(
      userAdministration =>
        utilisateur.administrations &&
        utilisateur.administrations.some(
          utilisateurAdministration =>
            userAdministration.id === utilisateurAdministration.id
        )
    )
  )

const permissionUtilisateurEntrepriseCheck = (
  user: IUtilisateur,
  utilisateur: IUtilisateur
) =>
  !!(
    user.entreprises &&
    permissionsCheck(user, ['entreprise']) &&
    permissionsCheck(utilisateur, ['entreprise']) &&
    // teste si l'utilisateur connecté (user) possède une entreprise en commun
    // avec l'utilisateur à afficher ou non (utilisateur)
    user.entreprises.some(userEntreprise =>
      utilisateur.entreprises?.some(
        utilisateurEntreprise => userEntreprise.id === utilisateurEntreprise.id
      )
    )
  )

const utilisateurEditionCheck = (utilisateur: IUtilisateur) => {
  const errors = []

  if (utilisateur.email && !emailCheck(utilisateur.email)) {
    errors.push('adresse email invalide')
  }

  if (
    !permissionsCheck(utilisateur, ['admin', 'editeur', 'lecteur']) &&
    utilisateur.administrations &&
    utilisateur.administrations.length
  ) {
    errors.push(
      "les permissions de cet utilisateur ne permettent pas de l'associer à une administration"
    )
  }

  if (
    !permissionsCheck(utilisateur, ['entreprise']) &&
    utilisateur.entreprises &&
    utilisateur.entreprises.length
  ) {
    errors.push(
      "les permissions de cet utilisateur ne permettent pas de l'associer à une entreprise"
    )
  }

  return errors
}

const utilisateurTestCheck = (email: string) =>
  (process.env.NODE_ENV !== 'production' || process.env.ENV !== 'prod') &&
  email === 'test@camino.local'

export {
  emailCheck,
  permissionUtilisateurEntrepriseCheck,
  permissionUtilisateurAdministrationCheck,
  utilisateurEditionCheck,
  utilisateurTestCheck
}