import './wallet'
import './vendor-page'
import './products-page'
import './product-page'
import './device-page'
import { Umi } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters'
import { base58 } from "@metaplex-foundation/umi/serializers"


global css
	body c:warm2 bg:warm8 ff:Arial
	button mr:1rem

	@root
		--width-card: 465px

def get_config
	const resp = await window.fetch('/config.json')
	await resp.json()

tag app
	rpc_url
	umi\Umi
	adapter\PhantomWalletAdapter

	def setup
		adapter = new PhantomWalletAdapter()

		const config = await get_config()
		rpc_url = config.rpc_url
		umi = createUmi(rpc_url).use(walletAdapterIdentity(adapter))
		imba.commit!


	def on_connected
		router.go `/vendor/{adapter.publicKey}`

	def on_disconnected
		router.go '/'

	def send_tx ev
		const { instructions, callback } = ev.detail
		const transaction = umi.transactions.create({
			version: 0,
			blockhash: (await umi.rpc.getLatestBlockhash()).blockhash,
			instructions,
			payer: umi.payer.publicKey,
		})

		const signedTransaction = await umi.identity.signTransaction(transaction)
		const signature = await umi.rpc.sendTransaction(signedTransaction, { skipPreflight: true })
		log('signature', base58.deserialize(signature)[0])
		const confirmResult = await umi.rpc.confirmTransaction(signature, {
			strategy: { type: 'blockhash', ...(await umi.rpc.getLatestBlockhash()) }
		})
		if confirmResult.value.err
			console.error('tx failed', confirmResult.value.err)
		else
			log('tx success', confirmResult.context.slot)
			if callback
				callback!

	<self>
		<main>
			<h1> 'DePHY ID'

			<wallet ctx=umi adapter=adapter @connected=on_connected @disconnected=on_disconnected>

			<nav>
				<a route-to='/'> <h2> 'Home'
				<a route-to=`/products/0`> <h2> 'All Products'
				if adapter..publicKey
					<a route-to=`/vendor/{adapter.publicKey}`> <h2> 'My Products'

			<article @send_tx=send_tx>
				<div route='/$'>
					unless adapter..connected
						<aside> <p> 'Connect Your Wallet to start'

				<products-page route='/products/:page' ctx=umi>
				<vendor-page route='/vendor/:vendor_pubkey' ctx=umi>
				<product-page route='/product/:mint_pubkey/:page' ctx=umi>
				<device-page route='/device/:pubkey' ctx=umi>

imba.mount <app>

