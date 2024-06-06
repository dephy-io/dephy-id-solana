import { PublicKey } from '@solana/web3.js'
import { TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, DEPHY_ID_PROGRAM_ID } from './constants'

export def getAToken mint_pubkey\PublicKey, wallet_pubkey\PublicKey
	PublicKey.findProgramAddressSync(
		[
			wallet_pubkey.toBuffer(),
			TOKEN_2022_PROGRAM_ID.toBuffer(),
			mint_pubkey.toBuffer(),
		],
		ASSOCIATED_TOKEN_PROGRAM_ID,
	)


export def getProductMint vendor_pubkey\PublicKey, product_name\string
	const te = new TextEncoder()
	PublicKey.findProgramAddressSync(
		[
			te.encode('DePHY_ID-PRODUCT'),
			vendor_pubkey.toBuffer(),
			te.encode(product_name),
		],
		DEPHY_ID_PROGRAM_ID,
	)


export def getDeviceMint product_mint_pubkey\PublicKey, device_pubkey\PublicKey
	const te = new TextEncoder()
	PublicKey.findProgramAddressSync(
		[
			te.encode('DePHY_ID-PRODUCT'),
			product_mint_pubkey.toBuffer(),
			device_pubkey.toBuffer(),
		],
		DEPHY_ID_PROGRAM_ID,
	)

