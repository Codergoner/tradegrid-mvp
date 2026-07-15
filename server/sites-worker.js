import seedShipments from './seed.json'

let shipments = structuredClone(seedShipments)

const json = (value, status = 200) => new Response(JSON.stringify(value), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8' },
})

const readBody = async request => {
  try { return await request.json() } catch { return null }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname

    if (path === '/api/shipments') {
      if (request.method === 'GET') return json(shipments)
      if (request.method === 'POST') {
        const shipment = await readBody(request)
        if (!shipment) return json({ error: 'Invalid shipment data' }, 400)
        shipments = [shipment, ...shipments]
        return json(shipment, 201)
      }
    }

    const match = path.match(/^\/api\/shipments\/([^/]+)$/)
    if (match) {
      const id = decodeURIComponent(match[1])
      const index = shipments.findIndex(shipment => shipment.id === id)
      if (request.method === 'GET') return index < 0 ? json({ error: 'Shipment not found' }, 404) : json(shipments[index])
      if (request.method === 'PUT') {
        const shipment = await readBody(request)
        if (!shipment) return json({ error: 'Invalid shipment data' }, 400)
        if (index < 0) shipments = [shipment, ...shipments]
        else shipments[index] = shipment
        return json(shipment)
      }
      if (request.method === 'DELETE') {
        shipments = shipments.filter(shipment => shipment.id !== id)
        return new Response(null, { status: 204 })
      }
    }

    if (path.startsWith('/api/')) return json({ error: 'This prototype endpoint is not available in the hosted demo.' }, 404)
    return env.ASSETS.fetch(request)
  },
}
