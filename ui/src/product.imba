import './pubkey'

tag product
	prop product

	<self>
		<aside>
			<a route-to=`/product/{product.mint_account}/0`>
				<h3> product.metadata.name
			<p> product.metadata.symbol
			<p> product.metadata.uri
			<p> <pubkey data=product.mint_account>

