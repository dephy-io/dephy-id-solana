import test from 'ava';
import { airdrop, createDefaultSolanaClient, createDefaultTransaction, createWallet, generateKeyPairSignerWithSol, getBalance, signAndSendTransaction } from "./_setup"
import { pipe, appendTransactionMessageInstruction, KeyPairSigner, Account, generateKeyPairSigner } from "@solana/web3.js"
import { Wallet, getMockSigner, wrapInstruction } from '../src';
import { getTransferSolInstruction } from "@solana-program/system";

let client: ReturnType<typeof createDefaultSolanaClient>
let authority: KeyPairSigner

const productName = 'Test ProxyCall Product'
let walletAccount: Account<Wallet>

test.before('prepare dephy-id and wallet', async () => {
    client = createDefaultSolanaClient()
    authority = await generateKeyPairSignerWithSol(client)

    walletAccount = await createWallet(client, authority, productName)
})

test('it can transfer from wallet vault', async (t) => {
    await airdrop(client, walletAccount.data.vault, 2_000_000_000n);
    const dest = await generateKeyPairSigner();

    t.assert(await getBalance(client, dest.address) == 0n, 'init balance')

    const amount = 1_000_000_000n

    const transferIx = getTransferSolInstruction({
        source: getMockSigner(walletAccount.data.vault),
        destination: dest.address,
        amount,
    })

    const wrappedTransferIx = await wrapInstruction(walletAccount, authority, transferIx)

    await pipe(
        await createDefaultTransaction(client, authority),
        (tx) => appendTransactionMessageInstruction(wrappedTransferIx, tx),
        (tx) => signAndSendTransaction(client, tx)
    )

    t.assert(await getBalance(client, dest.address) == amount, 'transfer success')
})
