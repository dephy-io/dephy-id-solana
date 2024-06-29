import test from 'ava';
import { airdrop, createDefaultSolanaClient, createDefaultTransaction, createWallet, generateKeyPairSignerWithSol, getBalance, signAndSendTransaction } from "./_setup"
import { pipe, appendTransactionMessageInstruction, KeyPairSigner, Account, AccountRole, generateKeyPairSigner } from "@solana/web3.js"
import { Wallet, getProxyCallInstructionAsync } from '../src';
import { SYSTEM_PROGRAM_ADDRESS, getTransferSolInstructionDataEncoder } from "@solana-program/system";

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

    const transferIx = {
        accounts: [{
            address: walletAccount.data.vault,
            role: AccountRole.WRITABLE_SIGNER,
        }, {
            address: dest.address,
            role: AccountRole.WRITABLE,
        }],
        SYSTEM_PROGRAM_ADDRESS,
        data: getTransferSolInstructionDataEncoder().encode({
            amount
        })
    }

    // TODO: add helper
    // const transferIx = getTransferSolInstruction({
    //     source: walletAccount.data.vault,
    //     destination: dest.address,
    //     amount: 1_000_000_000n
    // })

    const proxyTransferIx = await getProxyCallInstructionAsync({
        wallet: walletAccount.address,
        authority,
        targetProgram: SYSTEM_PROGRAM_ADDRESS,
        ixData: transferIx.data,
    })

    transferIx.accounts.forEach((a) => {
        if (a.address == walletAccount.data.vault) {
            switch (a.role) {
                case AccountRole.READONLY_SIGNER:
                    a.role = AccountRole.READONLY
                    break;
                case AccountRole.WRITABLE_SIGNER:
                    a.role = AccountRole.WRITABLE
                    break;
                default:
                    throw new Error("Vault must be Signer")
            }
            proxyTransferIx.accounts.push(a)
        } else {
            proxyTransferIx.accounts.push(a)
        }
    })

    await pipe(
        await createDefaultTransaction(client, authority),
        (tx) => appendTransactionMessageInstruction(proxyTransferIx, tx),
        (tx) => signAndSendTransaction(client, tx)
    )

    t.assert(await getBalance(client, dest.address) == amount, 'transfer success')
})
