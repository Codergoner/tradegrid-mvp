import { buildComplianceChecklist } from '../shared/compliance.js'

export function buildChecklist(data) {
  return buildComplianceChecklist(data)
}

export const shipmentTotal = data => (data.products || []).reduce((sum,p)=>sum + Number(p.quantity||0)*Number(p.unitPrice||0),0)

export function validateShipment(data) {
  const missing=[]
  const required = [
    ['exporter.companyName', data.exporter?.companyName], ['exporter.registrationNumber', data.exporter?.registrationNumber],
    ['exporter.address', data.exporter?.address], ['exporter.contactPerson', data.exporter?.contactPerson], ['exporter.email', data.exporter?.email],
    ['buyer.companyName', data.buyer?.companyName], ['buyer.address', data.buyer?.address], ['buyer.contactPerson', data.buyer?.contactPerson], ['buyer.email', data.buyer?.email],
    ['shipment.originCountry', data.shipment?.originCountry], ['shipment.destinationCountry', data.shipment?.destinationCountry], ['shipment.mode', data.shipment?.mode],
    ['shipment.incoterm', data.shipment?.incoterm], ['shipment.currency', data.shipment?.currency], ['shipment.departureDate', data.shipment?.departureDate], ['shipment.arrivalDate', data.shipment?.arrivalDate],
    ['products[0].name', data.products?.[0]?.name], ['products[0].description', data.products?.[0]?.description]
  ]
  required.forEach(([field, value]) => { if (value === '' || value === null || value === undefined) missing.push(field) })
  ;['quantity','unitPrice','netWeight','grossWeight','cartonCount'].forEach(field => {
    if (!(Number(data.products?.[0]?.[field]) > 0)) missing.push(`products[0].${field}`)
  })
  if (data.exporter?.email && !/^\S+@\S+\.\S+$/.test(data.exporter.email)) missing.push('exporter.email')
  if (data.buyer?.email && !/^\S+@\S+\.\S+$/.test(data.buyer.email)) missing.push('buyer.email')
  if (data.shipment?.departureDate && data.shipment?.arrivalDate && data.shipment.arrivalDate < data.shipment.departureDate) missing.push('shipment.arrivalDate')
  if (Number(data.products?.[0]?.grossWeight) < Number(data.products?.[0]?.netWeight)) missing.push('products[0].grossWeight')
  return missing
}

export function shipmentStatus(data) {
  const checklist = buildChecklist(data)
  return checklist.items.filter(item => item.required).every(item => item.status === 'Ready') ? 'Ready' : 'Needs info'
}
