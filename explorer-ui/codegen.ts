import { type CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'http://localhost:10700/branch/main/graphql',
  documents: ['src/queries.ts'],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    './src/gql/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typed-document-node',
      ]
    },
  },
}

export default config
