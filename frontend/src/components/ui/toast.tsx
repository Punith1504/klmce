import * as React from "react"
export const Toast = ({ children, ...props }: any) => <div {...props}>{children}</div>
export const ToastProvider = ({ children }: any) => <div>{children}</div>
export const ToastViewport = () => <div />
export const ToastTitle = ({ children }: any) => <div>{children}</div>
export const ToastDescription = ({ children }: any) => <div>{children}</div>
export const ToastClose = () => <button>X</button>
export const ToastAction = ({ children, ...props }: any) => <button {...props}>{children}</button>
