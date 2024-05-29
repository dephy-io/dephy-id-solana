import { PublicKey } from '@solana/web3.js'
import { Context, createNoopSigner } from '@metaplex-foundation/umi'
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters'
import './pubkey'


tag device-page
	prop ctx\Context
	loaded = false
	device

	def routed params, state
		loaded = false
		{device} = await load_device(params.pubkey)

	def load_device pubkey
		const res = await window.fetch(`/api/device/{pubkey}`)
		loaded = true
		return await res.json()

	def reload_vendor
		vendor = route.state.vendor = await load_products()

	<self>
		<h2> 'Device'

		if loaded
			<section>
				if device
					<p>
						<label> 'Pubkey'
						<pubkey data=device.pubkey>
					<p>
						<label> 'Name'
						<span> device.did.metadata.name
					<p>
						<label> 'Product'
						<a route-to=`/product/{device.product.mint_account}/0`> device.product.metadata.name
					<p>
						<label> 'Signing Alg'
						<span> device.signing_alg
					<p>
						<label> 'Mint At'
						<span> device.block_ts
					<p>
						<label> 'Owner'
						if device.did.owner
							<pubkey data=device.did.owner.pubkey>
						else
							<span> 'None'
				else
					<div> 'Device Not Found'
		else
			<div> 'Loading...'
