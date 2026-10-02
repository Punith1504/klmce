import * as React from "react"
export const Select = ({ children, ...props }: any) => <select {...props}>{children}</select>
export const SelectTrigger = ({ children, ...props }: any) => <div {...props}>{children}</div>
export const SelectValue = ({ children, ...props }: any) => <span {...props}>{children}</span>
export const SelectContent = ({ children, ...props }: any) => <div {...props}>{children}</div>
export const SelectItem = ({ children, ...props }: any) => <option {...props}>{children}</option>
