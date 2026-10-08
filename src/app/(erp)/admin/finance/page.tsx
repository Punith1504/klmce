import { requireRole,serverApi } from '@/lib/server-api';
import { ERPForm } from '@/components/erp-form';
import { RecordTable } from '@/components/record-table';
import type { SandboxInvoice } from '@/components/sandbox-invoices';
export default async function Page(){
 await requireRole('SUPER_ADMIN','INSTITUTION_ADMIN');
 const invoices=await serverApi<SandboxInvoice[]>('/finance/razorpay/invoices');
 return <section className="space-y-6 p-8"><h1 className="text-2xl font-semibold">Finance — Razorpay sandbox</h1>
  <p>TEST ONLY. Nothing here settles real student fees. Sandbox credentials must be configured on the backend. Live collection, refunds and settlement reconciliation remain disabled.</p>
  <ERPForm title="Create test invoice" endpoint="finance/razorpay/invoices" fields={[
   {name:'student_id',label:'Student UUID from the student directory'}, {name:'reference',label:'Unique invoice reference'},
   {name:'amount_paise',label:'Test amount in paise (₹1 = 100 paise)',type:'number',min:100,max:100000000,step:'1'}]}/>
  <RecordTable title="Latest 50 sandbox invoices and orders" rows={invoices}/>
  {invoices.filter(i=>i.order_status==='RESERVED').map(i=><ERPForm key={i.invoice_id} title={`Recover reserved order: ${i.reference}`} endpoint={`finance/razorpay/orders/${i.order_id}/reconcile`}
   fields={[{name:'provider_order_id',label:'Razorpay test order ID from merchant dashboard'}]}/>)}
  <p>For uncertain orders, locate the receipt equal to the local order UUID without hyphens in the Razorpay test dashboard. Recovery verifies the receipt, merchant and amount; it does not mark the invoice paid. Replay the captured-payment webhook afterward.</p>
 </section>;
}
