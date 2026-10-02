import * as React from "react"
export const Table = ({ className, ...props }: any) => <table className={className} {...props} />
export const TableHeader = ({ className, ...props }: any) => <thead className={className} {...props} />
export const TableBody = ({ className, ...props }: any) => <tbody className={className} {...props} />
export const TableRow = ({ className, ...props }: any) => <tr className={className} {...props} />
export const TableHead = ({ className, ...props }: any) => <th className={className} {...props} />
export const TableCell = ({ className, ...props }: any) => <td className={className} {...props} />
