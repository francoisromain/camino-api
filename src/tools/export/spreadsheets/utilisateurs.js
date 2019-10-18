import { utilisateursGet } from '../../../database/queries/utilisateurs'

const id = process.env.GOOGLE_SPREADSHEET_ID_EXPORT_UTILISATEURS

const get = () =>
  utilisateursGet({
    noms: undefined,
    entrepriseIds: undefined,
    administrationIds: undefined,
    permissionIds: undefined
  })

const tables = [
  {
    id: 1,
    name: 'utilisateurs',
    columns: [
      'id',
      'email',
      'motDePasse',
      'nom',
      'prenom',
      'telephoneFixe',
      'telephoneMobile',
      'permissionId',
      'preferences'
    ],
    callbacks: {
      preferences: v => JSON.stringify(v)
    }
  },
  {
    id: 2,
    name: 'utilisateurs__entreprises',
    columns: [
      { key: 'parent.id', value: 'utilisateurId' },
      { key: 'id', value: 'entrepriseId' }
    ],
    parents: ['entreprises']
  },
  {
    id: 3,
    name: 'utilisateurs__administrations',
    columns: [
      { key: 'parent.id', value: 'utilisateurId' },
      { key: 'id', value: 'administrationId' }
    ],
    parents: ['administrations']
  }
]

const spreadsheet = {
  id,
  name: 'utilisateurs',
  get,
  tables
}

export default spreadsheet
