'use server';
// Upload ownership and extraction provenance have not yet been implemented.
// Never persist invented OCR results or a caller-supplied document ID.
export async function saveDocumentRecord(_fileName:string,_fileUrl:string,_fileSize:number):Promise<{success:boolean,error?:string,docId?:string}> {
  return {success:false,error:'Document submissions are unavailable until secure storage is configured.'};
}
export async function processDocumentOCR(_docId:string) {
  return {success:false,error:'Document extraction is not configured. No results have been generated.'};
}
