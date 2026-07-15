import express from 'express'
import cors from 'cors'
import PDFDocument from 'pdfkit'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildChecklist, shipmentStatus, shipmentTotal, validateShipment } from './logic.js'
import { regulationSources, REGULATION_VERSION, LAST_VERIFIED } from '../shared/compliance.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'shipments.json')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
if (!fs.existsSync(DATA_FILE)) fs.copyFileSync(path.join(__dirname, 'seed.json'), DATA_FILE)

const read = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
const write = data => { const temp=`${DATA_FILE}.tmp`; fs.writeFileSync(temp, JSON.stringify(data, null, 2)); fs.renameSync(temp, DATA_FILE) }
const app = express(); app.use(cors()); app.use(express.json({limit:'1mb'}))

app.get('/api/health', (_req,res)=>res.json({ok:true}))
app.get('/api/regulations', (_req,res)=>res.json({version:REGULATION_VERSION,lastVerified:LAST_VERIFIED,sources:regulationSources}))
app.get('/api/shipments', (_req,res)=>res.json(read()))
app.get('/api/shipments/:id', (req,res)=>{const s=read().find(x=>x.id===req.params.id); s?res.json(s):res.status(404).json({error:'Shipment not found'})})
app.post('/api/shipments', (req,res)=>{const missing=validateShipment(req.body);if(missing.length)return res.status(400).json({error:'Missing required fields',fields:missing});const all=read();const value={...req.body,id:req.body.id||`TG-${Date.now().toString().slice(-5)}`,createdAt:req.body.createdAt||new Date().toISOString(),invoiceNumber:req.body.invoiceNumber||`INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,status:shipmentStatus(req.body),checklist:buildChecklist(req.body),documents:['Commercial Invoice','Packing List']};all.unshift(value);write(all);res.status(201).json(value)})
app.put('/api/shipments/:id', (req,res)=>{const all=read(),i=all.findIndex(x=>x.id===req.params.id);if(i<0)return res.status(404).json({error:'Shipment not found'});const updated={...all[i],...req.body,id:req.params.id};const missing=validateShipment(updated);if(missing.length)return res.status(400).json({error:'Missing required fields',fields:missing});all[i]={...updated,status:shipmentStatus(updated),checklist:buildChecklist(updated)};write(all);res.json(all[i])})
app.delete('/api/shipments/:id', (req,res)=>{const all=read(),next=all.filter(x=>x.id!==req.params.id);if(next.length===all.length)return res.status(404).json({error:'Shipment not found'});write(next);res.status(204).end()})
app.get('/api/shipments/:id/checklist', (req,res)=>{const s=read().find(x=>x.id===req.params.id);s?res.json(buildChecklist(s)):res.status(404).json({error:'Shipment not found'})})
app.post('/api/shipments/:id/generate-documents', (req,res)=>{const all=read(),i=all.findIndex(x=>x.id===req.params.id);if(i<0)return res.status(404).json({error:'Shipment not found'});all[i].documents=['Commercial Invoice','Packing List'];write(all);res.json({documents:all[i].documents})})

function header(doc,title,number){doc.fillColor('#145ce6').fontSize(22).font('Helvetica-Bold').text('TradeGrid',50,45);doc.fillColor('#17223b').fontSize(18).text(title,350,45,{align:'right'});doc.moveTo(50,80).lineTo(545,80).strokeColor('#17223b').lineWidth(1.5).stroke();doc.fillColor('#69758a').fontSize(8).text(`DOCUMENT NO.  ${number}`,350,92,{align:'right'})}
function party(doc,title,data,x,y){doc.fillColor('#69758a').fontSize(8).font('Helvetica-Bold').text(title,x,y);doc.fillColor('#17223b').fontSize(10).text(data.companyName,x,y+16);doc.font('Helvetica').fontSize(8).fillColor('#4f5d72').text(data.address,x,y+32,{width:210});doc.text(`${data.contactPerson}  ·  ${data.email}`,x,y+61,{width:210})}
function footer(doc){doc.moveTo(50,755).lineTo(545,755).strokeColor('#dce2ea').lineWidth(1).stroke();doc.fillColor('#7b8799').fontSize(7).text('Generated with TradeGrid · Prototype guidance only',50,765);doc.text('Page 1 of 1',480,765)}
function invoicePdf(s,res){const doc=new PDFDocument({size:'A4',margin:50});res.setHeader('Content-Type','application/pdf');res.setHeader('Content-Disposition',`attachment; filename="${s.invoiceNumber}.pdf"`);doc.pipe(res);header(doc,'COMMERCIAL INVOICE',s.invoiceNumber);party(doc,'EXPORTER',s.exporter,50,125);party(doc,'BUYER / CONSIGNEE',s.buyer,310,125);const p=s.products[0], total=shipmentTotal(s);doc.rect(50,225,495,48).fill('#f4f7fb');[['DESTINATION',s.shipment.destinationCountry],['INCOTERM',s.shipment.incoterm],['CURRENCY',s.shipment.currency],['MODE',s.shipment.mode]].forEach(([l,v],i)=>{doc.fillColor('#7a8699').fontSize(7).font('Helvetica-Bold').text(l,62+i*123,238);doc.fillColor('#17223b').fontSize(9).text(v,62+i*123,252)});doc.rect(50,300,495,25).fill('#17223b');doc.fillColor('#fff').fontSize(7).text('DESCRIPTION',60,309).text('HS CODE',300,309).text('QTY',370,309).text('UNIT PRICE',410,309).text('AMOUNT',490,309);doc.fillColor('#17223b').fontSize(9).font('Helvetica-Bold').text(p.name,60,340,{width:215});doc.font('Helvetica').fillColor('#6b778b').fontSize(7).text(p.description,60,355,{width:215});doc.fillColor('#17223b').fontSize(8).text(p.hsCode||'—',300,342).text(String(p.quantity),370,342).text(`${s.shipment.currency} ${Number(p.unitPrice).toFixed(2)}`,410,342).text(`${s.shipment.currency} ${total.toFixed(2)}`,490,342);doc.moveTo(50,390).lineTo(545,390).strokeColor('#dce2ea').stroke();doc.fillColor('#647086').fontSize(9).text('Subtotal',365,420).fillColor('#17223b').font('Helvetica-Bold').text(`${s.shipment.currency} ${total.toFixed(2)}`,470,420,{align:'right',width:75});doc.rect(355,443,190,38).fill('#f1f5f9');doc.fillColor('#17223b').fontSize(9).text('GRAND TOTAL',365,457).fontSize(12).text(`${s.shipment.currency} ${total.toFixed(2)}`,430,455,{align:'right',width:105});doc.font('Helvetica').fontSize(8).text('Authorised signature & company stamp',50,630);doc.moveTo(50,690).lineTo(260,690).strokeColor('#778397').stroke();footer(doc);doc.end()}
function packingPdf(s,res){const doc=new PDFDocument({size:'A4',margin:50});res.setHeader('Content-Type','application/pdf');res.setHeader('Content-Disposition',`attachment; filename="Packing-List-${s.id}.pdf"`);doc.pipe(res);header(doc,'PACKING LIST',`PL-${s.id.replace('TG-','')}`);party(doc,'EXPORTER',s.exporter,50,125);party(doc,'CONSIGNEE',s.buyer,310,125);const p=s.products[0];doc.rect(50,250,495,25).fill('#17223b');doc.fillColor('#fff').fontSize(7).text('DESCRIPTION',60,259).text('CARTONS',310,259).text('QUANTITY',370,259).text('NET WEIGHT',430,259).text('GROSS WEIGHT',495,259);doc.fillColor('#17223b').fontSize(9).font('Helvetica-Bold').text(p.name,60,290,{width:220});doc.font('Helvetica').fontSize(8).text(String(p.cartonCount),315,292).text(String(p.quantity),375,292).text(`${p.netWeight} kg`,430,292).text(`${p.grossWeight} kg`,495,292);doc.moveTo(50,340).lineTo(545,340).strokeColor('#dce2ea').stroke();[['TOTAL CARTONS',p.cartonCount],['TOTAL NET WEIGHT',`${p.netWeight} kg`],['TOTAL GROSS WEIGHT',`${p.grossWeight} kg`]].forEach(([l,v],i)=>{doc.rect(50+i*165,375,165,60).fill('#f3f6fa');doc.fillColor('#788496').font('Helvetica-Bold').fontSize(7).text(l,62+i*165,390);doc.fillColor('#17223b').fontSize(13).text(String(v),62+i*165,407)});doc.font('Helvetica').fontSize(8).text('Prepared by / company stamp',50,630);doc.moveTo(50,690).lineTo(260,690).strokeColor('#778397').stroke();footer(doc);doc.end()}

app.get('/api/shipments/:id/pdf/commercial-invoice',(req,res)=>{const s=read().find(x=>x.id===req.params.id);s?invoicePdf(s,res):res.status(404).json({error:'Shipment not found'})})
app.get('/api/shipments/:id/pdf/packing-list',(req,res)=>{const s=read().find(x=>x.id===req.params.id);s?packingPdf(s,res):res.status(404).json({error:'Shipment not found'})})
app.use(express.static(path.join(__dirname,'..','dist')))
app.use((_req,res)=>res.sendFile(path.join(__dirname,'..','dist','index.html')))
const port = Number(process.env.PORT) || 3001
app.listen(port, '0.0.0.0', () => console.log(`TradeGrid API running on port ${port}`))
