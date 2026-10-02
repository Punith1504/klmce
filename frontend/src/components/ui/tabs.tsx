import * as React from "react"
export const Tabs = ({ children, ...props }: any) => <div {...props}>{children}</div>
export const TabsList = ({ children, className }: any) => <div className={className}>{children}</div>
export const TabsTrigger = ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button>
export const TabsContent = ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>
