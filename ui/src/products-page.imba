import { createProduct } from './generated'
import { PublicKey } from '@solana/web3.js'
import { getAToken, getProductMint } from './pda'
import { Context, createNoopSigner } from '@metaplex-foundation/umi'
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters'
import './product'


tag products-page
	prop ctx\Context
	loaded = false
	products = []

	def routed params, state
		{products, limit, page} = await load_products(params.page)

	def load_products page
		const qs = new URLSearchParams({ page })
		const res = await window.fetch(`/api/products?{qs}`)
		loaded = true
		return await res.json()

	def reload_vendor
		vendor = route.state.vendor = await load_products()

	<self>
		<h2> 'Products'

		if loaded
			<section>
				for product in products
					<product product=product>
				else
					<aside> <p> 'No Products found'
