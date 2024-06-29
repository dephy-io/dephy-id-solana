import { Account, Address, IAccountMeta, IInstruction, TransactionPartialSigner, TransactionSigner } from "@solana/web3.js";
import { Wallet, ProxyCallInstruction } from "./generated";

export const getMockSigner: (address: Address) => TransactionPartialSigner;

export const wrapInstruction: (walletAccount: Account<Wallet>, authority: TransactionSigner, ix: IInstruction<string, IAccountMeta<string>[]>) => Promise<ProxyCallInstruction>
