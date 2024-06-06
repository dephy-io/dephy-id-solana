import { Context } from '@metaplex-foundation/umi'
import { getProducts } from './queries'
import './product'


tag products-page
	prop ctx\Context
	loaded = false
	products = []

	def routed _params, _state
		products = await load_products()

	def load_products
		const result = await getProducts()
		loaded = true
		return result.Product

	<self>
		<h2> 'Products'

		<section>
			for product in products
				<product product=product>
			else
				<aside> <p> 'No Products found'
