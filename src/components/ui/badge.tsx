import * as React from 'react';
type Props=React.HTMLAttributes<HTMLDivElement>&{variant?:'default'|'outline'|'secondary'|'destructive'};
export const Badge=({className='',variant='default',...props}:Props)=>(<div className={`${variant==='outline'?'border border-current rounded px-2':''} ${className}`} {...props}/>);
