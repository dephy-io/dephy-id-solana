import index from './index.html'
import express from 'express'
import { createClient } from 'edgedb'
import { getVendor, getProduct, getProducts, getDevice } from '../indexer/dbschema/queries'
import { parseArgs } from 'util'

const { values: args } = parseArgs({
	options: {
		database: {
			type: 'string',
			short: 'd',
			default: 'dephy-indexer',
		},
		port: {
			type: 'string',
			default: '3000',
		},
		rpc_url: {
			type: 'string',
			short: 'r',
			default: 'http://127.0.0.1:8899',
		},
	},
})


const app = express!
const db = await createClient(args.database).ensureConnected();

app.get '/api/vendor/:vendor_pubkey' do(req, res)
	let vendor = await getVendor(db, { vendor_pubkey: req.params['vendor_pubkey'] })
	res.send {vendor}

app.get '/api/product/:mint_account' do(req, res)
	const limit = 50
	const page = Number(req.query.page || 0)
	const offset = limit * page
	let product = await getProduct(db, {
		offset,
		limit,
		mint_account: req.params['mint_account']
	})
	res.send {product, limit, page}

app.get '/api/products' do(req, res)
	const limit = 20
	const page = Number(req.query.page || 0)
	const offset = limit * page
	let products = await getProducts(db, {
		offset,
		limit
	})
	res.send {products, limit, page}

app.get '/api/device/:pubkey' do(req, res)
	let device = await getDevice(db, { pubkey: req.params['pubkey'] })
	res.send {device}

app.get '/config.json' do(_req, res)
	res.send {
		rpc_url: args.rpc_url,
	}

app.get '/*' do(_req, res)
	res.send index.body


imba.serve app.listen(args.port)

