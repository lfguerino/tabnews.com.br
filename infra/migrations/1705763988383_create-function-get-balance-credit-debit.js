exports.up = async (pgm) => {
  await pgm.createFunction(
    'get_current_balance_credit_debit',
    [
      {
        name: 'balance_type_input',
        mode: 'IN',
        type: 'text',
      },
      {
        name: 'recipient_id_input',
        mode: 'IN',
        type: 'uuid',
      },
    ],
    {
      returns: 'TABLE (total_balance BIGINT, total_credit BIGINT, total_debit BIGINT)',
      language: 'plpgsql',
      replace: true,
    },
    `
    BEGIN
      RETURN QUERY
        SELECT
          COALESCE(SUM(amount), 0) AS total_balance,
          COALESCE(SUM(CASE WHEN amount >= 0 AND e.type = 'update:content:tabcoins' THEN amount END), 0) AS total_credit,
          COALESCE(SUM(CASE WHEN amount < 0 AND e.type = 'update:content:tabcoins' THEN amount END), 0) AS total_debit
        FROM
          balance_operations o
        JOIN
          events e ON e.id = o.originator_id
        WHERE
          balance_type = balance_type_input
          AND recipient_id = recipient_id_input;
    END;
  `
  );
};

exports.down = async (pgm) => {
  await pgm.dropFunction(
    'get_current_balance_credit_debit',
    [
      {
        name: 'balance_type_input',
        mode: 'IN',
        type: 'text',
      },
      {
        name: 'recipient_id_input',
        mode: 'IN',
        type: 'uuid',
      },
    ],
    { ifExists: true }
  );
};
