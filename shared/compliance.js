export const REGULATION_VERSION = 'MY-EXPORT-2026.07.2'
export const LAST_VERIFIED = '2026-07-15'

export const regulationSources = [
  {
    id: 'customs-export', agency: 'Royal Malaysian Customs Department',
    title: 'Export Procedures and K2 declaration guidance',
    law: 'Customs Act 1967 and Malaysian export declaration procedures',
    url: 'https://www.customs.gov.my/ms/perniagaan/import-eksport/eksport/prosedur-pengeksportan'
  },
  {
    id: 'customs-prohibition', agency: 'Royal Malaysian Customs Department',
    title: 'Prohibition of Import and Export',
    law: 'Customs (Prohibition of Exports) Order 2023 [P.U. (A) 122/2023]',
    url: 'https://www.customs.gov.my/en/individu/pengembara/prohibition-of-import-and-export'
  },
  {
    id: 'atiga-origin', agency: 'Ministry of Investment, Trade and Industry (MITI)',
    title: 'ATIGA origin, Form D and ASEAN-Wide Self-Certification',
    law: 'ASEAN Trade in Goods Agreement — preferential origin evidence',
    url: 'https://www.miti.gov.my/index.php/pages/view/3911?mid=1125'
  },
  {
    id: 'strategic-trade', agency: 'Ministry of Investment, Trade and Industry (MITI)',
    title: 'Strategic Trade Act 2010 controls',
    law: 'Strategic Trade Act 2010 [Act 708]',
    url: 'https://www.miti.gov.my/index.php/pages/view/sta2010?mid=1129'
  },
  {
    id: 'maqis', agency: 'Department of Malaysian Quarantine and Inspection Services (MAQIS)',
    title: 'MAQIS Acts and Regulations',
    law: 'Malaysian Quarantine and Inspection Services Act 2011 [Act 728] and 2013 Regulations',
    url: 'https://www.maqis.gov.my/index.php/akta/'
  },
  {
    id: 'matrade-docs', agency: 'Malaysia External Trade Development Corporation (MATRADE)',
    title: "Beginner's Guide to Exporting — logistics and documentation",
    law: 'Official practical guidance for commercial invoices and transport documents',
    url: 'https://www.matrade.gov.my/documents/ebook/guide_exporting/16/'
  }
]

const item = (name, description, status, required, sourceId, detail = '') => ({
  name, description, status, required, sourceId, detail
})

export function buildComplianceChecklist(data) {
  const p = data.products?.[0] || {}
  const s = data.shipment || {}
  const foodOrAgriculture = ['Food', 'Agriculture'].includes(s.productCategory)
  const coreReady = Boolean(
    data.exporter?.companyName && data.exporter?.registrationNumber && data.exporter?.address &&
    data.buyer?.companyName && data.buyer?.address && s.destinationCountry && s.departureDate &&
    s.arrivalDate && p.name && p.description && Number(p.quantity) > 0
  )
  const strategic = s.strategicGoods || 'Not sure'
  const staReady = strategic === 'No' || (strategic === 'Yes' && s.staPermitStatus === 'Obtained')
  const maqisReady = !foodOrAgriculture || ['Obtained', 'Verified not required'].includes(s.maqisStatus)
  const originEvidenceReady = ['Issued', 'Certified exporter declaration'].includes(s.originDocumentStatus)
  const originReady = !s.preferentialTariff || Boolean(s.originQualified && p.hsCode && originEvidenceReady)
  const transportReady = s.transportDocumentStatus === 'Issued'
  const customsReady = s.customsDeclarationStatus === 'Filed / accepted'

  const items = [
    item('Commercial Invoice', 'Itemised sale and transaction details used by buyer and customs.', coreReady ? 'Ready' : 'Needs Info', true, 'matrade-docs'),
    item('Packing List', 'Carton, quantity, net weight and gross weight breakdown.', coreReady && Number(p.cartonCount) > 0 && Number(p.grossWeight) > 0 ? 'Ready' : 'Needs Info', true, 'matrade-docs'),
    item('Customs Export Declaration (K2)', 'Exporter or appointed agent submits the electronic export declaration; permit information is validated in the Customs system when applicable.', customsReady ? 'Ready' : 'Needs Info', true, 'customs-export', 'TradeGrid records the filing outcome but does not submit or validate a CUSDEC declaration.'),
    item('Prohibited / Restricted Export Screening', 'Check the product against the current Customs prohibition order before export.', s.customsRestrictionChecked ? 'Ready' : 'Needs Info', true, 'customs-prohibition'),
    item('Air Waybill', 'Carrier-issued transport document for air freight.', s.mode === 'Air' ? (transportReady ? 'Ready' : 'Needs Info') : 'Not Applicable', s.mode === 'Air', 'matrade-docs'),
    item('Bill of Lading', 'Carrier-issued transport document for sea freight.', s.mode === 'Sea' ? (transportReady ? 'Ready' : 'Needs Info') : 'Not Applicable', s.mode === 'Sea', 'matrade-docs'),
    item('ATIGA Origin Evidence', 'A qualifying ASEAN tariff claim needs valid origin evidence: Form D/e-Form D, or an origin declaration by an approved Certified Exporter.', s.preferentialTariff ? (originReady ? 'Ready' : 'Needs Info') : 'Optional', !!s.preferentialTariff, 'atiga-origin'),
    item('Strategic Trade Act Screening / Permit', 'Strategic items, technology and controlled end-users may require an MITI permit and end-use statement.', strategic === 'No' ? 'Not Applicable' : (staReady ? 'Ready' : 'Needs Info'), strategic !== 'No', 'strategic-trade'),
    item('MAQIS Permit / Inspection Verification', `Screen ${s.productCategory || 'the product'} for permit, inspection and destination-country conditions.`, foodOrAgriculture ? (maqisReady ? 'Ready' : 'Needs Info') : 'Not Applicable', foodOrAgriculture, 'maqis')
  ]

  const warnings = []
  if (!p.hsCode) warnings.push('HS code is missing. Confirm the classification with Customs or your agent before the K2 declaration or an origin claim.')
  if (!customsReady) warnings.push('The K2 declaration is not recorded as filed and accepted.')
  if (['Air','Sea'].includes(s.mode) && !transportReady) warnings.push(`The carrier-issued ${s.mode === 'Air' ? 'Air Waybill' : 'Bill of Lading'} is not recorded as issued.`)
  if (s.preferentialTariff && !originEvidenceReady) warnings.push('Preferential tariff is selected, but no issued Form D/e-Form D or Certified Exporter origin declaration is recorded.')
  if (strategic === 'Not sure') warnings.push('Strategic-item status is not confirmed. Check the current Strategic Items List or ask MITI before export.')
  if (foodOrAgriculture && !maqisReady) warnings.push('Food and agricultural goods must be screened with MAQIS and against the importing country’s conditions.')

  return { items, warning: warnings.join(' '), warnings, regulationVersion: REGULATION_VERSION, lastVerified: LAST_VERIFIED }
}
