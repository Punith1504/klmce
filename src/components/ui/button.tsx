import * as React from 'react';
type Props=React.ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'default'|'outline'|'ghost'|'destructive'|'secondary'|'link';size?:'default'|'sm'|'lg'|'icon'};
export const Button=React.forwardRef<HTMLButtonElement,Props>(({className='',variant='default',size='default',...props},ref)=>(
  <button ref={ref} className={`${size==='icon'?'p-2':'px-3 py-2'} ${variant==='outline'?'border border-current rounded':''} ${className}`} {...props}/>
));
Button.displayName='Button';
