exports.up = knex =>
  knex.schema
    .createTable('entreprises', table => {
      table.string('id', 64).primary()
      table.string('nom').notNullable()
      table.string('paysId')
      table.string('legalSiren')
      table.string('legalEtranger')
      table.string('legalForme')
      table.string('categorie')
      table.string('dateCreation', 10)
      table.string('adresse')
      table.string('codePostal')
      table.string('commune')
      table.string('cedex')
      table.string('url', 1024)
      table.string('email')
      table.string('telephone')
      table.boolean('archive').defaultTo(false)
    })
    .createTable('entreprisesEtablissements', table => {
      table.string('id', 64).primary()
      table
        .string('entrepriseId', 64)
        .index()
        .references('entreprises.id')
        .notNullable()
        .onDelete('CASCADE')
      table.string('nom')
      table.string('legalSiret')
      table.string('dateDebut', 10)
      table.string('dateFin', 10)
    })
    .createTable('entreprises__documentsTypes', table => {
      table
        .string('documentTypeId', 3)
        .index()
        .references('documentsTypes.id')
        .notNullable()
      table.primary(['documentTypeId'])
    })
    .createTable('entreprises__titresTypes', table => {
      table
        .string('entrepriseId')
        .index()
        .references('entreprises.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        .notNullable()
      table
        .string('titreTypeId')
        .index()
        .references('titresTypes.id')
        .notNullable()
      table.boolean('titresCreation')
      table.primary(['entrepriseId', 'titreTypeId'])
    })
    .createTable('administrationsTypes', table => {
      table.string('id', 64).primary()
      table.string('nom').notNullable()
      table.integer('ordre')
    })
    .createTable('administrations', table => {
      table.string('id', 64).primary()
      table
        .string('typeId')
        .index()
        .references('administrationsTypes.id')
        .notNullable()
      table.string('nom').notNullable()
      table.string('abreviation', 255)
      table.string('service')
      table.string('url', 1024)
      table.string('email')
      table.string('telephone')
      table.string('adresse1')
      table.string('adresse2')
      table.string('codePostal')
      table.string('commune')
      table.string('cedex')
      table.string('departementId').index().references('departements.id')
      table.string('regionId').index().references('regions.id')
    })
    .createTable('administrations__titresTypes', table => {
      table
        .string('administrationId')
        .index()
        .references('administrations.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        .notNullable()
      table
        .string('titreTypeId')
        .index()
        .references('titresTypes.id')
        .notNullable()
      table.boolean('gestionnaire')
      table.boolean('associee')
      table.primary(['administrationId', 'titreTypeId'])
    })
    .createTable('administrations__titresTypes__titresStatuts', table => {
      table
        .string('administrationId')
        .index()
        .references('administrations.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        .notNullable()
      table
        .string('titreTypeId')
        .index()
        .references('titresTypes.id')
        .notNullable()
      table
        .string('titreStatutId')
        .index()
        .references('titresStatuts.id')
        .notNullable()
      table.boolean('titresModificationInterdit')
      table.boolean('demarchesModificationInterdit')
      table.boolean('etapesModificationInterdit')
      table.primary(['administrationId', 'titreTypeId', 'titreStatutId'])
    })
    .createTable('administrations__titresTypes__etapesTypes', table => {
      table
        .string('administrationId')
        .index()
        .references('administrations.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        .notNullable()
      table
        .string('titreTypeId')
        .index()
        .references('titresTypes.id')
        .notNullable()
      table
        .string('etapeTypeId')
        .index()
        .references('etapesTypes.id')
        .notNullable()
      table.boolean('lectureInterdit')
      table.boolean('creationInterdit')
      table.boolean('modificationInterdit')
      table.primary(['administrationId', 'titreTypeId', 'etapeTypeId'])
    })
    .createTable('administrations__activitesTypes', table => {
      table
        .string('activiteTypeId', 3)
        .index()
        .references('activitesTypes.id')
        .notNullable()
        .onDelete('CASCADE')
      table
        .string('administrationId', 64)
        .notNullable()
        .index()
        .references('administrations.id')
        .onDelete('CASCADE')
      table.boolean('modificationInterdit')
      table.boolean('lectureInterdit')
      table.primary(['administrationId', 'activiteTypeId'])
    })
    .createTable('permissions', table => {
      table.string('id', 12).primary()
      table.string('nom').notNullable()
      table.integer('ordre')
    })
    .createTable('utilisateurs', table => {
      table.string('id').primary()
      table.string('email').unique()
      table.string('motDePasse').notNullable()
      table.string('nom')
      table.string('prenom')
      table.string('telephoneFixe')
      table.string('telephoneMobile')
      table.string('refreshToken')
      table
        .string('permissionId', 12)
        .index()
        .references('permissions.id')
        .notNullable()
      table.json('preferences')
      table.boolean('newsletter')
    })
    .createTable('utilisateurs__entreprises', table => {
      table
        .string('utilisateurId', 64)
        .index()
        .references('utilisateurs.id')
        .onDelete('CASCADE')
      table
        .string('entrepriseId', 64)
        .index()
        .references('entreprises.id')
        .onDelete('CASCADE')
    })
    .createTable('utilisateurs__administrations', table => {
      table
        .string('utilisateurId', 64)
        .index()
        .references('utilisateurs.id')
        .onDelete('CASCADE')
      table
        .string('administrationId', 64)
        .index()
        .references('administrations.id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
    })
    .createTable('etapesTypes__justificatifsTypes', table => {
      table
        .string('etapeTypeId', 3)
        .index()
        .references('etapesTypes.id')
        .notNullable()
        .onDelete('CASCADE')
      table
        .string('documentTypeId', 3)
        .index()
        .references('entreprises__documentsTypes.documentTypeId')
        .notNullable()
      table.boolean('optionnel')
      table.primary(['etapeTypeId', 'documentTypeId'])
    })

exports.down = knex =>
  knex.schema
    .dropTable('etapesTypes__justificatifsTypes')
    .dropTable('utilisateurs__administrations')
    .dropTable('utilisateurs__entreprises')
    .dropTable('utilisateurs')
    .dropTable('permissions')
    .dropTable('entreprisesEtablissements')
    .dropTable('entreprises')
    .dropTable('administrations__titresTypes')
    .dropTable('administrations__titresTypes__titresStatuts')
    .dropTable('administrations__titresTypes__etapesTypes')
    .dropTable('administrations__activitesTypes')
    .dropTable('administrations')
    .dropTable('administrationsTypes')
