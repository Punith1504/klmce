import * as React from "react"
export const Avatar = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={className} {...props} />
export const AvatarImage = ({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => <img className={className} {...props} />
export const AvatarFallback = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={className} {...props} />
