const {
  titreTravauxRapportAdd
} = require('../../postgres/queries/titres-travaux')

const { utilisateurGet } = require('../../postgres/queries/utilisateurs')

const { titreGet } = require('../../postgres/queries/titres')

const { permissionsCheck } = require('./_permissions')

const resolvers = {
  async titreTravauxRapportAjouter({ rapport }, context, info) {
    const errors = []
    const titre = await titreGet(rapport.titreId)

    if (!permissionsCheck(context.user, ['super', 'admin', 'editeur'])) {
      errors.push('opération impossible')
    } else if (permissionsCheck(context.user, ['societe'])) {
      const user = await utilisateurGet(context.user.id)

      if (user.entrepriseId !== titre.titulaire.id) {
        errors.push('opération impossible')
      }
    }

    if (
      !(
        titre.domaineId === 'm' &&
        (titre.typeId === 'cxx' ||
          titre.typeId === 'pxm' ||
          titre.typeId === 'axm')
      )
    ) {
      errors.push('ce titre ne peut pas recevoir de rapport')
    }

    if (!errors.length) {
      return titreTravauxRapportAdd({ titreTravauxRapport: rapport })
    } else {
      throw new Error(errors.join(', '))
    }
  }
}

module.exports = resolvers