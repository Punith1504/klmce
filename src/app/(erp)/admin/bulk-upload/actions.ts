'use server';
export async function processBulkStudents(_records:unknown[],_batchId:string,_sectionId:string) {
  return {success:false,error:'Use the authenticated CSV import API with canonical section IDs.',message:'No records were imported.',errors:['Legacy batch mapping is unavailable.']};
}
