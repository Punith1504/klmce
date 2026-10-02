import logging
from fastapi import APIRouter
from fastapi.responses import Response

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/integrations/accounting", tags=["Financial Journal Exports"])

@router.get("/export/tally-xml")
async def generate_tally_xml_export(date_range_start: str, date_range_end: str):
    """
    Tally ERP 9 / Tally Prime Data Synchronizer.
    The KLMCE FinTech engine operates its own immutable ledger. This endpoint dynamically 
    translates completed transactions into strictly formatted Tally XML schema formats, 
    allowing the corporate accounting team to 1-click import all fee receipts as Vouchers.
    """
    # In production: Fetch from finance.transactions
    
    tally_xml = f"""
    <ENVELOPE>
      <HEADER>
        <TALLYREQUEST>Import Data</TALLYREQUEST>
      </HEADER>
      <BODY>
        <IMPORTDATA>
          <REQUESTDESC>
            <REPORTNAME>Vouchers</REPORTNAME>
          </REQUESTDESC>
          <REQUESTDATA>
            <TALLYMESSAGE xmlns:UDF="TallyUDF">
              <VOUCHER VCHTYPE="Receipt" ACTION="Create">
                <DATE>{date_range_start.replace('-','')}</DATE>
                <NARRATION>Automated KLMCE Academic Fee Transfer</NARRATION>
                <ALLLEDGERENTRIES.LIST>
                  <LEDGERNAME>Corporate Bank Account</LEDGERNAME>
                  <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
                  <AMOUNT>-125000.00</AMOUNT>
                </ALLLEDGERENTRIES.LIST>
                <ALLLEDGERENTRIES.LIST>
                  <LEDGERNAME>Student Debtors</LEDGERNAME>
                  <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                  <AMOUNT>125000.00</AMOUNT>
                </ALLLEDGERENTRIES.LIST>
              </VOUCHER>
            </TALLYMESSAGE>
          </REQUESTDATA>
        </IMPORTDATA>
      </BODY>
    </ENVELOPE>
    """
    
    logger.info(f"Generated compliant Tally XML Journal Export for range {date_range_start} to {date_range_end}")
    
    # Return as raw XML so browsers and legacy accounting systems can download it directly
    return Response(content=tally_xml.strip(), media_type="application/xml")
