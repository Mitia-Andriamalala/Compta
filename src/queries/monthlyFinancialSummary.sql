WITH monthly_totals AS (
  SELECT 
    DATE_TRUNC('month', fa.dateacct) as month_date,
    CASE 
      WHEN ev.value LIKE '7%' THEN COALESCE(SUM(fa.amtacctcr - fa.amtacctdr), 0)
      WHEN ev.value LIKE '6%' THEN COALESCE(SUM(fa.amtacctdr - fa.amtacctcr), 0)
    END as amount,
    CASE 
      WHEN ev.value LIKE '7%' THEN 'REVENUE'
      WHEN ev.value LIKE '6%' THEN 'EXPENSE'
    END as type
  FROM fact_acct fa
  JOIN c_elementvalue ev ON fa.account_id = ev.c_elementvalue_id
  WHERE 
    fa.ad_client_id = $1
    AND fa.ad_org_id = $2
    AND EXTRACT(YEAR FROM fa.dateacct) = $3
    AND (ev.value LIKE '6%' OR ev.value LIKE '7%')
    AND fa.postingtype = 'A'  -- Écritures réelles
  GROUP BY 
    DATE_TRUNC('month', fa.dateacct),
    CASE 
      WHEN ev.value LIKE '7%' THEN 'REVENUE'
      WHEN ev.value LIKE '6%' THEN 'EXPENSE'
    END
)
SELECT 
  month_date,
  COALESCE(SUM(CASE WHEN type = 'REVENUE' THEN amount ELSE 0 END), 0) as total_revenue,
  COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as total_expenses
FROM monthly_totals
GROUP BY month_date
ORDER BY month_date; 