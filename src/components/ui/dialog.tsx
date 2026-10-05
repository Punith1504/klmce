import * as React from "react"
export const Dialog = ({ children }: any) => <div>{children}</div>
export const DialogTrigger = ({ children }: any) => <div>{children}</div>
export const DialogContent = ({ children, className }: any) => <div className={className}>{children}</div>
export const DialogHeader = ({ children, className }: any) => <div className={className}>{children}</div>
export const DialogTitle = ({ children, className }: any) => <h2 className={className}>{children}</h2>
export const DialogDescription = ({ children, className }: any) => <p className={className}>{children}</p>
export const DialogFooter = ({ children, className }: any) => <div className={className}>{children}</div>
