import { AccountRole } from "@solana/web3.js";
import { getProxyCallInstructionAsync } from "./generated";

export const getMockSigner = (address) => ({
    address,
    signTransactions: async (_transactions, _config) => []
})

export const wrapInstruction = async (walletAccount, authority, ix) => {
    const wrappedIx = await getProxyCallInstructionAsync({
        wallet: walletAccount.address,
        authority,
        targetProgram: ix.programAddress,
        ixData: ix.data ?? new Uint8Array(),
    })

    ix.accounts?.forEach((a) => {
        if (a.address == walletAccount.data.vault) {
            switch (a.role) {
                case AccountRole.READONLY_SIGNER:
                    wrappedIx.accounts.push({
                        address: a.address,
                        role: AccountRole.READONLY
                    })
                    break;
                case AccountRole.WRITABLE_SIGNER:
                    wrappedIx.accounts.push({
                        address: a.address,
                        role: AccountRole.WRITABLE
                    })
                    break;
                case AccountRole.READONLY:
                    wrappedIx.accounts.push({
                        address: a.address,
                        role: AccountRole.READONLY
                    })
                    break;
                case AccountRole.WRITABLE:
                    wrappedIx.accounts.push({
                        address: a.address,
                        role: AccountRole.WRITABLE
                    })
                    break;
            }
        } else {
            wrappedIx.accounts.push(a)
        }
    })

    return wrappedIx
}
