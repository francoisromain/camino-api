import { basename } from 'path'
import { execSync } from 'child_process'

import 'dotenv/config'
import '../../init'

import { documentsGet } from '../../database/queries/documents'
import { IDocument, Index } from '../../types'
import { exhaustiveCheck } from '../exhaustive-type-check'

type IndexFile = Index<{ document: IDocument; path: string }>

const etapeGet = (str: string) => str.split('-').slice(0, -1).join('-')

const hashGet = (str: string) => str.split('-').pop()

const matchFuzzy = (name: string, index: Index<any>, partGet = hashGet) => {
  const hash = name.split('-').pop()

  return Object.keys(index).reduce((r: string[], key) => {
    // on ne garde pas les matches entiers pendant un fuzzy
    if (key === name) {
      return r
    }

    const part = partGet(key)

    if (part === hash) {
      r.push(key)
    }

    return r
  }, [])
}

const filesNoDocumentCheck = (
  documentsIndex: IndexFile,
  filesIndex: Index<string>
) => {
  const filesMissing = Object.keys(filesIndex)
    .sort()
    .reduce(
      (
        r: {
          name: string
          documentsHashMatches: string[]
          filesHashMatches: string[]
          filesEtapeMatches: string[]
        }[],
        fileName
      ) => {
        if (fileName && !documentsIndex[fileName]) {
          r.push({
            name: filesIndex[fileName],
            documentsHashMatches: matchFuzzy(fileName, documentsIndex),
            filesHashMatches: matchFuzzy(fileName, filesIndex),
            filesEtapeMatches: matchFuzzy(fileName, filesIndex, etapeGet)
          })
        }

        return r
      },
      []
    )
    // trie les fichiers sans hash en base en premier
    .sort(
      (a, b) =>
        a.documentsHashMatches.length +
        a.filesHashMatches.length +
        a.filesEtapeMatches.length -
        (b.documentsHashMatches.length +
          b.filesHashMatches.length +
          b.filesEtapeMatches.length)
    )

  if (filesMissing.length) {
    console.info(
      `${filesMissing.length} fichiers ne correspondent à aucun document dans la base de données`
    )

    filesMissing.forEach(file => {
      console.info(`- ${file.name}`)

      if (file.documentsHashMatches.length) {
        const documentsHashMatchesString = ` (${file.documentsHashMatches.length} hashe(s) en base)`

        console.info(
          `${documentsHashMatchesString}:`,
          file.documentsHashMatches.join(', ')
        )
      }

      if (
        file.filesHashMatches.length &&
        file.filesHashMatches[0] !== file.documentsHashMatches[0]
      ) {
        const filesHashMatchesString = ` (${file.filesHashMatches.length} autre(s) hashe(s) dans les fichiers)`

        console.info(
          `${filesHashMatchesString}:`,
          file.filesHashMatches.join(', ')
        )
      }

      if (
        file.filesEtapeMatches.length &&
        file.filesEtapeMatches[0] !== file.documentsHashMatches[0]
      ) {
        const filesEtapeMatchesString = ` (${file.filesEtapeMatches.length} autre(s) etape(s) dans les fichiers)`

        console.info(
          `${filesEtapeMatchesString}:`,
          file.filesEtapeMatches.join(', ')
        )
      }
    })
  } else {
    console.info(
      'Tous les fichiers correspondent à des documents dans la base de données'
    )
  }
}

const filesPathCheck = (
  documentsIndex: IndexFile,
  filesIndex: Index<string>
) => {
  const filesPathInvalid = Object.keys(filesIndex)
    .sort()
    .filter(
      fileName =>
        fileName &&
        documentsIndex[fileName] &&
        filesIndex[fileName].substr(8) !== documentsIndex[fileName].path
    )

  if (filesPathInvalid.length) {
    console.info(
      `${filesPathInvalid.length} fichiers ne sont pas au bon endroit sur le disque`
    )
    filesPathInvalid.forEach(file =>
      console.info(
        `- ${filesIndex[file].substr(8)} -> ${documentsIndex[file].path}`
      )
    )
  } else {
    console.info('Tous les fichiers sont au bon endroit sur le disque')
  }
}

const documentsNoFileCheck = (
  documentsIndex: IndexFile,
  filesIndex: Index<string>
) => {
  const documentsFichiersMissing = Object.keys(documentsIndex)
    .filter(documentId => !filesIndex[documentId])
    .sort()

  if (documentsFichiersMissing.length) {
    console.info(
      `${documentsFichiersMissing.length} documents en base de données n'ont pas de fichiers correspondants`
    )

    documentsFichiersMissing.forEach(documentId => {
      const document = documentsIndex[documentId].document
      console.info(
        `-      ${documentId}.${document.fichierTypeId} -> ${document.titreEtapeId}`
      )

      const matches = matchFuzzy(documentId, filesIndex)

      if (matches.length) {
        matches.forEach(name => {
          console.info(`Match: ${filesIndex[name]}`)
        })
      }
    })
  } else {
    console.info(
      'Tous les documents en base de données ont des fichiers correspondants'
    )
  }
}

const filesNamesFind = () =>
  execSync('find ./files | grep pdf').toString().split('\n')

const documentPathGet = (document: IDocument) => {
  let path = document.type!.repertoire as string

  if (document.type!.repertoire === 'demarches') {
    path = `${path}/${document.titreEtapeId}`
  } else if (document.type!.repertoire === 'entreprises') {
    path = `${path}/${document.entrepriseId}`
  } else if (document.type!.repertoire === 'activites') {
    path = `${path}/${document.titreActiviteId}`
  } else if (document.type!.repertoire === 'travaux') {
    path = `${path}/${document.titreTravauxEtapeId}`
  } else {
    exhaustiveCheck(document.type!.repertoire)
  }

  return `${path}/${document.id}.${document.fichierTypeId}`
}

const main = async () => {
  const documents = await documentsGet({}, {}, 'super')

  const documentsIndex = documents.reduce((res: IndexFile, document) => {
    if (document.fichier) {
      res[document.id] = { document, path: documentPathGet(document) }
    }

    return res
  }, {})

  const filesIndex = filesNamesFind().reduce((res: Index<string>, fileName) => {
    if (fileName) {
      res[basename(fileName.split('/').pop()!, '.pdf')] = fileName
    }

    return res
  }, {})

  documentsNoFileCheck(documentsIndex, filesIndex)

  console.info()

  filesNoDocumentCheck(documentsIndex, filesIndex)

  console.info()

  filesPathCheck(documentsIndex, filesIndex)

  process.exit(0)
}

main()