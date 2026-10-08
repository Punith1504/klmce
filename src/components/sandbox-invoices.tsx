import { requireRole,serverApi } from '@/lib/server-api';
import { SandboxCheckout } from './sandbox-checkout';
export type SandboxInvoice={invoice_id:string,student_id:string,reference:string,amount_paise:number,currency:string,
  mode:'TEST',status:string,order_id:string|null,order_status:string|null,provider_order_id:string|null};
export async function SandboxInvoices({roles}:{roles:string[]}){
  await requireRole(...roles);
  const invoices=await serverApi<SandboxInvoice[]>('/finance/razorpay/invoices');
  return <section className="space-y-4 p-6"><h2 className="text-xl font-semibold">Razorpay sandbox</h2>
    <p>TEST ONLY. These invoices and captures do not change real fee balances. Use test payment details only. Refunds and live payments are not enabled.</p>
    {!invoices.length&&<p>No sandbox invoices assigned.</p>}
    {invoices.map(i=><article key={i.invoice_id} className="space-y-2 rounded border p-4">
      <h3>{i.reference}</h3><p>Test amount: ₹{(i.amount_paise/100).toFixed(2)} · Sandbox status: {i.status}</p>
      {i.status==='UNPAID'&&(i.order_status==='RESERVED'?<p>Order pending administrator reconciliation. Do not retry payment.</p>:<SandboxCheckout invoiceId={i.invoice_id}/>)}
    </article>)}
    {invoices.length===50&&<p>Showing the latest 50 sandbox invoices. Contact the administrator for older invoices.</p>}
  </section>;
}
