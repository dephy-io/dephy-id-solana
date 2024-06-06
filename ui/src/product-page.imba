import { PublicKey } from '@solana/web3.js'
import { Context, createNoopSigner } from '@metaplex-foundation/umi'
import { getAToken, getDeviceMint } from './pda'
import { createDevice, DeviceSigningAlgorithm } from './generated'
import './pubkey'
import './product'
import { getProduct } from './queries'


tag product-page
	prop ctx\Context
	loaded = false
	product
	limit
	page

	device_params = {
		pubkey: '',
		name: 'Device #1',
		symbol: 'DP1',
		uri: 'https://example.com',
	}

	def routed params, state
		# TODO: cache results
		log('Product params', params)
		{product, limit, page} = await load_product(params.mint_pubkey, params.page)
		imba.commit!

	def load_product mint_pubkey\string, page\number = 0
		const limit = 50
		const offset = limit * page
		const result = await getProduct(mint_pubkey, offset, limit)
		log 'Product', result
		{
			product: result.Product[0],
			limit,
			page
		}

	def reload_devices
		'ok'

	def vendor_pubkey
		ctx.identity.publicKey

	def create_device
		const product_mint_account = new PublicKey(product.mint_account)
		const device_pubkey = new PublicKey(device_params.pubkey)
		let [deviceMint, deviceMintBump] = getDeviceMint(product_mint_account, device_pubkey)
		let productAssociatedToken = getAToken(product_mint_account, device_pubkey)

		log('Create Device', deviceMint.toBase58!, productAssociatedToken)
		const instructions = createDevice(ctx, {
			productMint: product_mint_account,
			productAssociatedToken,
			vendor: createNoopSigner(vendor_pubkey!),
			device: device_pubkey,
			deviceMint: [deviceMint, deviceMintBump],
			signingAlg: DeviceSigningAlgorithm.Ed25519,
			name: device_params.name,
			symbol: device_params.symbol,
			uri: device_params.uri,
			additionalMetadata: []
		}).getInstructions()
		console.log('instructions', instructions)

		emit('send_tx', { instructions, callback: do() reload_devices! })


	<self>
		<h2> 'Product'

		if product
			<section>
				<product product=product>

			<section>
				<div> `{product.device_count} devices`
				<div>
					for i in [0 ... Math.ceil(product.devices_count / limit)]
						<a[ml:0.3rem] route-to=`/product/{product.mint_account}/{i}`> i

			<section>
				<table>
					<thead>
						<tr>
							<th> '#'
							<th> 'Pubkey'
							<th> 'Name'
							<th> 'Owner'
							<th>
					<tbody>
						for device, i in product.devices
							<tr>
								<td> <a route-to=`/device/{device.pubkey}`> `#{page * limit + i}`
								<td> <pubkey data=device.pubkey>
								<td> device.did.metadata.name
								<td>
									if device.did.owner
										<pubkey data=device.did.owner.pubkey>
									else
										'None'


		if __DEV__
			<section>
				<form @submit.prevent>
					<h3> 'Create Device'
					<label htmlFor='device_pubkey'> 'Pubkey'
					<input name='device_pubkey' type='text' bind=device_params.pubkey>
					<label htmlFor='device_name'> 'Name'
					<input name='device_name' type='text' bind=device_params.name>
					<label htmlFor='device_symbol'> 'Symbol'
					<input name='device_symbol' type='text' disabled value=product.metadata.symbol>
					<label htmlFor='device_uri'> 'URI'
					<input name='device_uri' type='text' bind=device_params.uri>

					<button @click=create_device> 'Create Device'

