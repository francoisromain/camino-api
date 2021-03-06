import { Model } from 'objection'
import { ITitreTypeTitreStatut } from '../../types'

interface TitresTypesTitresStatuts extends ITitreTypeTitreStatut {}

class TitresTypesTitresStatuts extends Model {
  public static tableName = 'titresTypes__titresStatuts'

  public static jsonSchema = {
    type: 'object',
    required: ['titreTypeId', 'titreStatutId'],

    properties: {
      titreTypeId: { type: 'string', maxLength: 3 },
      titreStatutId: { type: 'string', maxLength: 3 },
      publicLecture: { type: 'boolean' }
    }
  }

  public static idColumn = ['titreTypeId', 'titreStatutId']
}

export default TitresTypesTitresStatuts
