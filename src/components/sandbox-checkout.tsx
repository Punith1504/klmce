'use client';
import Script from 'next/script';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Options={key:string,order_id:string,amount:number,currency:string,name:string,description:string,
  handler:()=>void,modal:{ondismiss:()=>void}};
declare global {interface Window {Razorpay?:new(options:Options)=>{open:()=>void,on:(event:string,callback:()=>void)=>void}}}

export function SandboxCheckout({invoiceId}:{invoiceId:string}) {
  const [ready,setReady]=useState(false);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
  const router=useRouter();
  return <div className="space-y-2">
    <Script src="https://checkout.razorpay.com/v1/checkout.js" onReady={()=>setReady(true)} onError={()=>setMessage('Sandbox checkout could not load.')}/>
    <button disabled={!ready||busy} className="rounded border px-4 py-2 disabled:opacity-50" onClick={async()=>{
      setBusy(true);setMessage('');
      try {
        const response=await fetch(`/api/erp/finance/razorpay/invoices/${invoiceId}/order`,{method:'POST'});
        const order=await response.json();
        if(!response.ok)throw new Error(typeof order.detail==='string'?order.detail:'Unable to create sandbox order');
        if(order.mode!=='TEST'||!order.key_id?.startsWith('rzp_test_')||!window.Razorpay)throw new Error('Only test-mode checkout is supported.');
        const checkout=new window.Razorpay({key:order.key_id,order_id:order.order_id,amount:order.amount,currency:order.currency,
          name:'KLMCE ERP sandbox',description:'TEST ONLY — does not pay real fees',
          handler:()=>{setMessage('Checkout returned. Awaiting signed provider confirmation; refresh to check the sandbox ledger.');setBusy(false);router.refresh();},
          modal:{ondismiss:()=>{setBusy(false);setMessage('Checkout closed. No payment is assumed; refresh to check provider confirmation.');}}
        });
        checkout.on('payment.failed',()=>{setBusy(false);setMessage('Test payment failed. Ask the administrator to review the provider order before another attempt.');});
        checkout.open();
      } catch(error){setMessage(error instanceof Error?error.message:'Unable to start checkout');setBusy(false);}
    }}>Open test checkout</button>
    <button className="ml-3 underline" onClick={()=>router.refresh()}>Refresh confirmation</button>
    <p role="status">{message}</p>
  </div>;
}
