const { pool } = require('./config/database');

async function fixPayments() {
  try {
    console.log('\n=== MISE À JOUR DES PAIEMENTS ===\n');

    const [result] = await pool.execute(
      `UPDATE payments
       SET paidDate = createdAt
       WHERE status = 'paid' AND paidDate IS NULL`
    );

    console.log(`✓ ${result.affectedRows} paiement(s) mis à jour avec paidDate`);

    const [payments] = await pool.execute(
      'SELECT id, amount, status, paidDate FROM payments WHERE status = "paid"'
    );

    console.log(`\n=== PAIEMENTS AVEC STATUT "PAID" ===\n`);
    payments.forEach(p => {
      console.log(`ID: ${p.id} | Montant: ${p.amount} | Date paiement: ${p.paidDate || 'NULL'}`);
    });

    await pool.end();
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

fixPayments();
