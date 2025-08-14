WITH user_stats AS (
      SELECT
          id,
          email,
          created_at,
          updated_at,
          EXTRACT(YEAR FROM created_at) AS join_year,
          EXTRACT(MONTH FROM created_at) AS join_month,
          DATE_PART('day', CURRENT_TIMESTAMP - created_at) AS account_age_days,
          RANK() OVER (ORDER BY created_at ASC) AS join_rank
      FROM public."user"
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '6 months'
  )
  SELECT
      join_year,
      join_month,
      COUNT(*) AS total_users,
      ROUND(AVG(account_age_days)::numeric, 1) AS avg_account_age_days,
      MAX(account_age_days) AS oldest_account_days,
      MIN(account_age_days) AS newest_account_days
  FROM user_stats
  GROUP BY join_year, join_month
  ORDER BY join_year DESC, join_month DESC;
