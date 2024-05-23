import { parseArgs } from "util"
import { Indexer } from "./src/indexer"

try {
    const { values: config } = parseArgs({
        options: {
            rpcUrl: {
                type: 'string',
                short: 'r',
                default: 'http://127.0.0.1:8899',
            },
            pubSubUrl: {
                type: 'string',
                short: 's',
                default: 'ws://127.0.0.1:8900',
            },
            databaseUrl: {
                type: 'string',
                short: 'd'
            },
            programId: {
                type: 'string',
                short: 'p',
                default: 'hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1'
            },
            pluginsDir: {
                type: 'string',
                default: './src/plugins'
            }
        }
    })

    let indexer = new Indexer(config)
    await indexer.ensureConnected()
    console.log('Connected')

    await indexer.run(config.programId!, 'confirmed')

    // [ABORTED] Reaching this line means the subscription was aborted — i.e. unsubscribed.
} catch (e) {
    // [FAILED] Reaching this line means the subscription went down.
    // Retry it, then recover from potential missed messages.
    console.error(e)
} finally {
    // [ABORTED or FAILED] Whether the subscription failed or was aborted, you can run cleanup code here.
}
