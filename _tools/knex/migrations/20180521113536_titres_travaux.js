exports.up = (knex, Promise) => {
  return knex.schema.createTable('titresTravaux', table => {
    table.string('id', 3).primary()
    table.string('nom').notNullable()
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable('titresTravaux')
}