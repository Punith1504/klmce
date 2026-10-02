import * as React from "react"
export const Sheet = ({ children }: any) => <div>{children}</div>
export const SheetTrigger = ({ children }: any) => <div>{children}</div>
export const SheetContent = ({ children, className }: any) => <div className={className}>{children}</div>
export const SheetHeader = ({ children, className }: any) => <div className={className}>{children}</div>
export const SheetTitle = ({ children, className }: any) => <h2 className={className}>{children}</h2>
export const SheetDescription = ({ children, className }: any) => <p className={className}>{children}</p>
