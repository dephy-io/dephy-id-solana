import { createProduct } from './generated'
import { PublicKey } from '@solana/web3.js'
import { getAToken, getProductMint } from './pda'
import { Context, createNoopSigner } from '@metaplex-foundation/umi'
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters'
import './product'


tag vendor-page
	prop ctx\Context
	loaded = false
	vendor
	product_params = {
		name: 'Example Product',
		symbol: 'DP1',
		uri: 'https://example.com',
	}

	def vendor_pubkey
		new PublicKey(route.params.vendor_pubkey)

	def routed params, state
		{vendor} = await load_vendor(params.vendor_pubkey)
		log 'Vendor', params.vendor_pubkey, vendor

	def load_vendor vendor_pubkey\PublicKey
		if vendor_pubkey
			let res = await window.fetch(`/api/vendor/{vendor_pubkey}`)
			loaded = true
			return await res.json()

	def reload_vendor
		vendor = route.state.vendor = await load_vendor(vendor_pubkey!)

	def create_product
		let [productMint, productMintBump] = getProductMint(vendor_pubkey!, product_params.name)

		log('Create product', product_params.name, productMint.toBase58!)
		const instructions = createProduct(ctx, {
			vendor: createNoopSigner(fromWeb3JsPublicKey(vendor_pubkey!)),
			productMint: [productMint, productMintBump],
			name: product_params.name,
			symbol: product_params.symbol,
			uri: product_params.uri,
			additionalMetadata: []
		}).getInstructions()

		emit('send_tx', { instructions, callback: do() reload_vendor! })


	<self>
		<h2> 'Vendor'

		if loaded
			if vendor..pubkey
				<p> <pubkey data=vendor.pubkey>
				<section>
					for product in vendor.products
						<product product=product>
			else
				<aside> <p> 'No Products found'

		<section>
			<form @submit.prevent>
				<h3> 'Create Product'
				<label htmlFor='product_name'> 'Name'
				<input name='product_name' type='text' bind=product_params.name>
				<label htmlFor='product_symbol'> 'Symbol'
				<input name='product_symbol' type='text' bind=product_params.symbol>
				<label htmlFor='product_uri'> 'URI'
				<input name='product_uri' type='text' bind=product_params.uri>

				<button @click=create_product> 'Create Product'

