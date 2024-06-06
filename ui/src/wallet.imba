import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { Context, displayAmount, sol } from '@metaplex-foundation/umi'


tag wallet
	prop ctx\Context
	prop adapter\PhantomWalletAdapter
	provider = null
	balance = null

	def awaken
		adapter.on('connect', do(pubkey) connected(pubkey))
		await adapter.autoConnect()

	def connect_solana
		await adapter.connect()

	def connected pubkey
		await update_balance()
		emit('connected', pubkey)
		console.log('connected', pubkey.toBase58!)

	def update_balance
		balance = await ctx.rpc.getBalance(adapter.publicKey)

	def disconnect
		await adapter.disconnect()
		emit('disconnected')

	def airdrop
		await ctx.rpc.airdrop(adapter.publicKey, sol(10))
		await update_balance!

	<self>
		if adapter..connected
			<p>
				'Wallet '
				<pubkey data=adapter.publicKey>
			if balance
				<p> displayAmount(balance)
			<button @click=disconnect> 'Disconnect'
			<button @click=airdrop> 'Airdrop'
		else
			<button @click=connect_solana disabled=adapter..connecting> 'Connect'

