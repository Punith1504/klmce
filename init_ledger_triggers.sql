-- ==============================================================================
-- Immutable Ledger Constraints
-- Automatically rejects any UPDATE or DELETE operations on fee_ledger_entries.
-- All adjustments (refunds, waivers) must be recorded as compensatory inserts.
-- ==============================================================================

CREATE OR REPLACE FUNCTION prevent_ledger_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'fee_ledger_entries is an append-only ledger. UPDATE and DELETE are strictly prohibited.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER strict_append_only_ledger
BEFORE UPDATE OR DELETE ON fee_ledger_entries
FOR EACH ROW EXECUTE FUNCTION prevent_ledger_mutation();
