import { ITitrePoint } from '../../../types'

const titrePoints = [
  {
    id: 'h-cx-courdemanges-1988-oct01-dpu01-1',
    groupe: 1,
    contour: 1,
    point: 1,
    coordonnees: { x: 0, y: 0 }
  },
  {
    id: 'h-cx-courdemanges-1988-oct01-dpu01-2',
    groupe: 1,
    contour: 1,
    point: 2,
    coordonnees: { x: 0, y: 1 }
  },
  {
    id: 'h-cx-courdemanges-1988-oct01-dpu01-3',
    groupe: 1,
    contour: 1,
    point: 1,
    coordonnees: { x: 1, y: 1 }
  }
] as ITitrePoint[]

const titreGeojson = {
  type: 'Feature',
  properties: { etapeId: 'h-cx-courdemanges-1988-oct01-dpu01' },
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [1, 1],
          [0, 1],
          [1, 1]
        ]
      ]
    ]
  }
}

export { titrePoints, titreGeojson }
