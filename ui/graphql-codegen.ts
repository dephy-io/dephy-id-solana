import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'http://localhost:10705/branch/main/graphql',
  documents: ['src/queries.ts'],
  generates: {
    './src/gql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typed-document-node',
      ]
    }
  }
}

export default config
