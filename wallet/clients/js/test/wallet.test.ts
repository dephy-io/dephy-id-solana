import test from 'ava';
import { createDefaultSolanaClient, createDefaultTransaction, createProductAndDevice, generateKeyPairSignerWithSol, initDephyId, signAndSendTransaction } from "./_setup"
import { Key, Wallet, fetchWalletFromSeeds, getCreateInstructionAsync } from "../src"
import { pipe, appendTransactionMessageInstruction, Account } from "@solana/web3.js"

let client: ReturnType<typeof createDefaultSolanaClient>

test.before('prepare dephy-id', async () => {
    client = createDefaultSolanaClient()
    await initDephyId(client)
})

test('it creates a wallet with did token', async (t) => {
    const productName = 'Test Wallet Product'
    const owner = await generateKeyPairSignerWithSol(client)

    const {
        vendor,
        productAssociatedToken,
        device,
        deviceAssociatedToken
    } = await createProductAndDevice(client, owner, productName)

    const authority = await generateKeyPairSignerWithSol(client)
    const createIx = await getCreateInstructionAsync({
        authority,
        vendor: vendor.address,
        productAssociatedToken,
        device: device.address,
        deviceAssociatedToken,
        productName,
    })

    await pipe(
        await createDefaultTransaction(client, authority),
        (tx) => appendTransactionMessageInstruction(createIx, tx),
        (tx) => signAndSendTransaction(client, tx)
    )

    const wallet = await fetchWalletFromSeeds(client.rpc, {
        authority: authority.address,
        device: device.address,
    })

    t.like(wallet, <Account<Wallet>>{
        data: {
            key: Key.Wallet,
            authority: authority.address,
            device: device.address,
        }
    })
})
