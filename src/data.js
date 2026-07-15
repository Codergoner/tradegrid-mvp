export const seedShipments = [
  {
    id: 'TG-24018', createdAt: '2026-07-12T09:20:00.000Z', status: 'Ready', invoiceNumber: 'INV-2026-0718',
    exporter: { companyName: 'Bumi Harvest Sdn. Bhd.', registrationNumber: '202101028451', address: '18 Jalan Perindustrian 4, Shah Alam, Selangor', contactPerson: 'Aina Rahman', email: 'aina@bumiharvest.my', phone: '+60 12-884 2109' },
    buyer: { companyName: 'Merlion Fine Foods Pte. Ltd.', address: '71 Ubi Road 1, Singapore 408732', contactPerson: 'Ethan Lim', email: 'ethan@merlionfoods.sg', phone: '+65 6812 9021' },
    shipment: { originCountry: 'Malaysia', destinationCountry: 'Singapore', mode: 'Land', incoterm: 'DAP', currency: 'SGD', departureDate: '2026-07-18', arrivalDate: '2026-07-19', preferentialTariff: true, productCategory: 'Food', customsRestrictionChecked: true, customsDeclarationStatus: 'Filed / accepted', transportDocumentStatus: 'Not applicable', strategicGoods: 'No', staPermitStatus: 'Not required', originQualified: true, originDocumentStatus: 'Issued', maqisStatus: 'Obtained' },
    products: [{ name: 'Premium White Coffee', description: '3-in-1 instant white coffee, 15 sachets per box', hsCode: '2101.12', quantity: 480, unitPrice: 6.8, netWeight: 172.8, grossWeight: 196.5, cartonCount: 40 }], documents: ['Commercial Invoice', 'Packing List']
  },
  {
    id: 'TG-24017', createdAt: '2026-07-10T04:45:00.000Z', status: 'Needs info', invoiceNumber: 'INV-2026-0717',
    exporter: { companyName: 'Nusa Living Sdn. Bhd.', registrationNumber: '201901034821', address: '22 Jalan Taming Sari, Muar, Johor', contactPerson: 'Daniel Tan', email: 'daniel@nusaliving.my', phone: '+60 16-331 4482' },
    buyer: { companyName: 'Siam Habitat Co., Ltd.', address: '88 Sukhumvit Road, Bangkok 10110, Thailand', contactPerson: 'Pim Suthida', email: 'pim@siamhabitat.co.th', phone: '+66 82 510 8861' },
    shipment: { originCountry: 'Malaysia', destinationCountry: 'Thailand', mode: 'Sea', incoterm: 'FOB', currency: 'USD', departureDate: '2026-07-22', arrivalDate: '2026-07-27', preferentialTariff: false, productCategory: 'General', customsRestrictionChecked: false, customsDeclarationStatus: 'Not filed', transportDocumentStatus: 'Not issued', strategicGoods: 'Not sure', staPermitStatus: 'Not started', originQualified: false, originDocumentStatus: 'Not started', maqisStatus: 'Not checked' },
    products: [{ name: 'Rattan Lounge Chairs', description: 'Handcrafted indoor rattan chair, natural finish', hsCode: '', quantity: 60, unitPrice: 84, netWeight: 540, grossWeight: 618, cartonCount: 60 }], documents: ['Commercial Invoice', 'Packing List']
  }
]

export const emptyShipment = {
  exporter: { companyName: '', registrationNumber: '', address: '', contactPerson: '', email: '', phone: '' },
  buyer: { companyName: '', address: '', contactPerson: '', email: '', phone: '' },
  shipment: { originCountry: 'Malaysia', destinationCountry: 'Singapore', mode: 'Air', incoterm: 'FOB', currency: 'USD', departureDate: '', arrivalDate: '', preferentialTariff: false, productCategory: 'General', customsRestrictionChecked: false, customsDeclarationStatus: 'Not filed', transportDocumentStatus: 'Not issued', strategicGoods: 'Not sure', staPermitStatus: 'Not started', originQualified: false, originDocumentStatus: 'Not started', maqisStatus: 'Not checked' },
  products: [{ name: '', description: '', hsCode: '', quantity: 1, unitPrice: 0, netWeight: 0, grossWeight: 0, cartonCount: 1 }]
}

export function buildChecklist(data) {
  return buildComplianceChecklist(data)
}

export function totalFor(shipment) { return shipment.products.reduce((sum, p) => sum + Number(p.quantity || 0) * Number(p.unitPrice || 0), 0) }
import { buildComplianceChecklist } from '../shared/compliance.js'
