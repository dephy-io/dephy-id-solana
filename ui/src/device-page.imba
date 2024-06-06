import { Context } from '@metaplex-foundation/umi'
import { getDevice } from './queries'
import './pubkey'


tag device-page
	prop ctx\Context
	loaded = false
	device

	def routed params, _state
		loaded = false
		device = await load_device(params.pubkey)
		log 'device', device

	def load_device device_pubkey\string
		const result = await getDevice(device_pubkey)
		loaded = true
		return result.Device[0]


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
						<span> device.tx.block_ts
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
