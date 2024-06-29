import {
    Address,
    Commitment,
    CompilableTransactionMessage,
    TransactionMessageWithBlockhashLifetime,
    Rpc,
    RpcSubscriptions,
    SolanaRpcApi,
    SolanaRpcSubscriptionsApi,
    TransactionSigner,
    airdropFactory,
    createSolanaRpc,
    createSolanaRpcSubscriptions,
    createTransactionMessage,
    generateKeyPairSigner,
    getSignatureFromTransaction,
    lamports,
    pipe,
    sendAndConfirmTransactionFactory,
    setTransactionMessageFeePayerSigner,
    setTransactionMessageLifetimeUsingBlockhash,
    signTransactionMessageWithSigners,
    address,
    appendTransactionMessageInstructions,
    appendTransactionMessageInstruction,
} from '@solana/web3.js';
import {
    fetchMaybeProgramDataAccountFromSeeds,
    findDeviceATokenPda,
    findDeviceMintPda,
    findProductATokenPda,
    findProductMintPda,
    findProgramDataAccountPda,
    getCreateActivatedDeviceInstruction,
    getCreateProductInstruction,
    getInitializeInstruction
} from '@dephy-io/dephy-id-program-client';
import { fetchWalletFromSeeds, getCreateInstructionAsync } from '../src';

type Client = {
    rpc: Rpc<SolanaRpcApi>;
    rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
};

export const createDefaultSolanaClient = (): Client => {
    const rpc = createSolanaRpc('http://127.0.0.1:8899');
    const rpcSubscriptions = createSolanaRpcSubscriptions('ws://127.0.0.1:8900');
    return { rpc, rpcSubscriptions };
};

export const generateKeyPairSignerWithSol = async (
    client: Client,
    putativeLamports: bigint = 1_000_000_000n
) => {
    const signer = await generateKeyPairSigner();
    await airdropFactory(client)({
        recipientAddress: signer.address,
        lamports: lamports(putativeLamports),
        commitment: 'confirmed',
    });
    return signer;
};

export const airdrop = async (client: Client, recipientAddress: Address, putativeLamports: bigint) => {
    await airdropFactory(client)({
        lamports: lamports(putativeLamports),
        recipientAddress,
        commitment: 'confirmed',
    })
}

export const createDefaultTransaction = async (
    client: Client,
    feePayer: TransactionSigner
) => {
    const { value: latestBlockhash } = await client.rpc
        .getLatestBlockhash()
        .send();
    return pipe(
        createTransactionMessage({ version: 0 }),
        (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
        (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx)
    );
};

export const signAndSendTransaction = async (
    client: Client,
    transactionMessage: CompilableTransactionMessage &
        TransactionMessageWithBlockhashLifetime,
    commitment: Commitment = 'confirmed'
) => {
    const signedTransaction =
        await signTransactionMessageWithSigners(transactionMessage);
    const signature = getSignatureFromTransaction(signedTransaction);
    await sendAndConfirmTransactionFactory(client)(signedTransaction, {
        commitment,
    });
    return signature;
};

export const getBalance = async (client: Client, address: Address) =>
    (await client.rpc.getBalance(address, { commitment: 'confirmed' }).send())
        .value;


export let dephyAuthority: TransactionSigner
export const initDephyId = async (
    client: Client,
) => {
    const dephyAccount = await fetchMaybeProgramDataAccountFromSeeds(client.rpc)
    if (dephyAccount.exists) {
        return
    }

    dephyAuthority = await generateKeyPairSignerWithSol(client)
    const [transaction, [programDataAccount, bump]] = await Promise.all([
        createDefaultTransaction(client, dephyAuthority),
        findProgramDataAccountPda(),
    ])

    const initIx = getInitializeInstruction({
        payer: dephyAuthority,
        programData: programDataAccount,
        authority: dephyAuthority,
        bump,
    })

    await pipe(
        transaction,
        (tx) => appendTransactionMessageInstruction(initIx, tx),
        (tx) => signAndSendTransaction(client, tx)
    )
}

export const createProductAndDevice = async (
    client: Client,
    owner: TransactionSigner,
    productName: string,
) => {
    const [transaction, vendor, device] = await Promise.all([
        createDefaultTransaction(client, owner),
        generateKeyPairSignerWithSol(client),
        generateKeyPairSigner(),
    ])

    const [productMint, _productMintBump] = await findProductMintPda({
        vendorPubkey: vendor.address,
        productName,
    })
    const [productAssociatedToken, _productAssociatedTokenBump] = await findProductATokenPda({
        devicePubkey: device.address,
        productMintPubkey: productMint,
    }, {
        programAddress: address('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
    })

    const [deviceMint, _deviceMintBump] = await findDeviceMintPda({
        productMintPubkey: productMint,
        devicePubkey: device.address
    })

    const [deviceAssociatedToken, _deviceAssociatedTokenBump] = await findDeviceATokenPda({
        deviceMintPubkey: deviceMint,
        ownerPubkey: owner.address,
    }, {
        programAddress: address('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
    })

    const ixs = [
        getCreateProductInstruction({
            payer: vendor,
            vendor,
            productMint,
            name: productName,
            symbol: 'TEST',
            uri: '',
            additionalMetadata: []
        }),
        getCreateActivatedDeviceInstruction({
            vendor: vendor.address,
            productMint,
            productAssociatedToken,
            device,
            deviceMint,
            deviceAssociatedToken,
            owner: owner.address,
            name: 'Test Device',
            uri: '',
            additionalMetadata: []
        })
    ]

    await pipe(
        transaction,
        (tx) => appendTransactionMessageInstructions(ixs, tx),
        (tx) => signAndSendTransaction(client, tx)
    )

    return {
        vendor,
        productMint,
        productAssociatedToken,
        device,
        deviceMint,
        deviceAssociatedToken,
    }
}

export const createWallet = async (client: Client, authority: TransactionSigner, productName: string) => {
    const {
        vendor,
        productAssociatedToken,
        device,
        deviceAssociatedToken
    } = await createProductAndDevice(client, authority, productName)

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

    return await fetchWalletFromSeeds(client.rpc, {
        authority: authority.address,
        device: device.address,
    })
}
