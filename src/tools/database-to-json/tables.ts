// Liste des noms des tables à sauvegarder au format json
const tables = [
  'activites_statuts',
  'activites_types',
  'activites_types__documents_types',
  'activites_types__pays',
  'administrations',
  'administrations__activites_types',
  'administrations__titres_types',
  'administrations__titres_types__etapes_types',
  'administrations__titres_types__titres_statuts',
  'administrations_types',
  'annees',
  'communes',
  'definitions',
  'demarches_statuts',
  'demarches_types',
  'departements',
  'devises',
  'documents',
  'documents_types',
  'domaines',
  'entreprises',
  'entreprises_etablissements',
  'etapes_statuts',
  'etapes_types',
  'etapes_types__etapes_statuts',
  'forets',
  'frequences',
  'geo_systemes',
  'globales',
  'mois',
  'pays',
  'permissions',
  'phases_statuts',
  'references_types',
  'regions',
  'substances',
  'substances__substances_legales',
  'substances_fiscales',
  'substances_legales',
  'substances_legales_codes',
  'titres',
  'titres_activites',
  'titres_administrations_gestionnaires',
  'titres_administrations_locales',
  'titres_amodiataires',
  'titres_communes',
  'titres_demarches',
  'titres_demarches_liens',
  'titres_etapes',
  'titres_etapes_justificatifs',
  'titres_forets',
  'titres_phases',
  'titres_points',
  'titres_points_references',
  'titres_references',
  'titres_statuts',
  'titres_substances',
  'titres_titulaires',
  'titres_travaux',
  'titres_travaux_etapes',
  'titres_types',
  'titres_types__activites_types',
  'titres_types__demarches_types',
  'titres_types__demarches_types__etapes_types',
  'titres_types__titres_statuts',
  'titres_types_types',
  'travaux_types',
  'travaux_types__etapes_types',
  'trimestres',
  'unites',
  'utilisateurs',
  'utilisateurs__administrations',
  'utilisateurs__entreprises'
]

export { tables }
