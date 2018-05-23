const { Model } = require('objection')

class Travaux extends Model {
  static get tableName() {
    return 'titresTravaux'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'nom'],

      properties: {
        id: { type: 'string', maxLength: 3 },
        nom: { type: 'string' }
      }
    }
  }
}

module.exports = Travaux