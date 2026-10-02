{{ config(
    materialized='incremental',
    unique_key='record_id',
    partition_by={
      "field": "attendance_date",
      "data_type": "date",
      "granularity": "month"
    },
    cluster_by=['tenant_id', 'student_id']
) }}

WITH raw_attendance AS (
    SELECT * FROM {{ source('klmce_cdc_landing', 'attendance_records') }}
    
    {% if is_incremental() %}
        -- Optimization: In a massive database (millions of rows), only process 
        -- the raw CDC logs that hit the warehouse since the last run.
        WHERE created_at > (SELECT MAX(created_at) FROM {{ this }})
    {% endif %}
)

SELECT 
    a.record_id,
    a.tenant_id,
    a.student_id,
    a.slot_id,
    a.academic_year,
    DATE(a.date) AS attendance_date,
    
    -- Time-Series ML Features: Does a student skip class more often on Fridays?
    EXTRACT(DAYOFWEEK FROM a.date) as day_of_week_index,
    
    a.status,
    
    -- One-Hot Encoding vectors directly inside the Data Warehouse. 
    -- Python Data Scientists no longer need to write pandas dummy variable scripts.
    CASE WHEN a.status = 'ABSENT' THEN 1 ELSE 0 END as absent_flag,
    CASE WHEN a.status = 'LATE' THEN 1 ELSE 0 END as late_flag,
    
    a.created_at
FROM raw_attendance a
WHERE a.__deleted = 'false'
