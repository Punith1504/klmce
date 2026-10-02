{{ config(
    materialized='table',
    tags=['core', 'ml_features']
) }}

WITH raw_students AS (
    SELECT * FROM {{ source('klmce_cdc_landing', 'students') }}
),
raw_tenants AS (
    SELECT * FROM {{ source('klmce_cdc_landing', 'tenants') }}
)

SELECT
    s.student_id,
    s.tenant_id,
    t.institution_name,
    s.enrollment_number,
    s.grade_level,
    s.enrollment_status,
    s.created_at AS enrolled_date,
    
    -- Feature Engineering for Data Scientists (Predictive Churn Models)
    DATE_DIFF(CURRENT_DATE(), DATE(s.created_at), MONTH) as tenure_months,
    
    -- Binary categorization for lightning-fast ML logistic regressions
    CASE WHEN s.enrollment_status = 'ALUMNI' THEN 1 ELSE 0 END as is_alumni_binary,
    CASE WHEN s.enrollment_status = 'DROPOUT' THEN 1 ELSE 0 END as is_dropout_binary
    
FROM raw_students s
LEFT JOIN raw_tenants t ON s.tenant_id = t.tenant_id

-- Filter out records that were physically deleted in Postgres 
-- but preserved as soft-deletes by Debezium's rewrite mode.
WHERE s.__deleted = 'false'
