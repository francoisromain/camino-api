const { Model } = require('objection')
const Entreprises = require('./entreprises')

class TitresAmodiataires extends Model {
  static get tableName() {
    return 'titres_amodiataires'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['entreprise_id', 'titre_demarche_etape_id'],

      properties: {
        entreprise_id: { type: 'string', maxLength: 64 },
        titre_demarche_etape_id: { type: 'string', maxLength: 128 }
      }
    }
  }

  static get relationMappings() {
    return {
      substance: {
        relation: Model.BelongsToOneRelation,
        modelClass: Entreprises,
        join: {
          from: 'titres_amodiataires.entreprise_id',
          to: 'entreprises.id'
        }
      }
    }
  }
}

module.exports = TitresAmodiataires
