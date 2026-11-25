#!/usr/bin/env node
/**
 * ONE-TIME cleanup of fictional filter values typed into staging profiles.
 *
 * Removes ONLY these four exact values (case-sensitive, whole-value match):
 *   Elvish, Zorkian, ZorkianSkill, ZorkianCraft
 *
 * Scope:
 *   - creator_profiles + professional_profiles:
 *       country / city (string columns) -> set NULL where the value equals
 *       one of the four.
 *       languages / skills / industries (text[] columns) -> array_remove
 *       the value.
 *   - campaigns:
 *       country / city only (same NULL rule). Campaign skills are a
 *       simple-array text column and are NOT touched.
 *
 * Deliberately NOT removed: Astrophysics / Marine Biology. They are real
 * words (fields of study, not industries); they no longer surface in any
 * filter because filter options now come from the standardized dataset,
 * and they disappear from a profile when its owner next edits it.
 *
 * No schema change, no migration. Idempotent: a second run changes 0.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node api/scripts/cleanup-fictional-filter-values.js --dry-run
 *   DATABASE_URL=postgres://... node api/scripts/cleanup-fictional-filter-values.js
 *
 * DATABASE_URL comes from the environment (e.g. Railway Variables) —
 * NEVER put any credential in this script.
 */
const { Client } = require('pg');

const FICTIONAL_VALUES = ['Elvish', 'Zorkian', 'ZorkianSkill', 'ZorkianCraft'];

// [table, column, kind] — kind 'string' sets NULL, kind 'array' array_removes.
const TARGETS = [
  ['creator_profiles', 'country', 'string'],
  ['creator_profiles', 'city', 'string'],
  ['creator_profiles', 'languages', 'array'],
  ['creator_profiles', 'skills', 'array'],
  ['creator_profiles', 'industries', 'array'],
  ['professional_profiles', 'country', 'string'],
  ['professional_profiles', 'city', 'string'],
  ['professional_profiles', 'languages', 'array'],
  ['professional_profiles', 'skills', 'array'],
  ['professional_profiles', 'industries', 'array'],
  ['campaigns', 'country', 'string'],
  ['campaigns', 'city', 'string'],
];

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set in the environment. Aborting.');
    process.exit(1);
  }
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    console.log(
      `${dryRun ? '[DRY RUN] Planned changes' : 'Applying cleanup'} for values: ${FICTIONAL_VALUES.join(', ')}`,
    );
    let grandTotal = 0;
    for (const [table, column, kind] of TARGETS) {
      for (const value of FICTIONAL_VALUES) {
        let count;
        if (dryRun) {
          const predicate =
            kind === 'string' ? `"${column}" = $1` : '$1 = ANY("' + column + '")';
          const res = await client.query(
            `SELECT count(*)::int AS n FROM "${table}" WHERE ${predicate}`,
            [value],
          );
          count = res.rows[0].n;
        } else if (kind === 'string') {
          const res = await client.query(
            `UPDATE "${table}" SET "${column}" = NULL WHERE "${column}" = $1`,
            [value],
          );
          count = res.rowCount;
        } else {
          const res = await client.query(
            `UPDATE "${table}" SET "${column}" = array_remove("${column}", $1) WHERE $1 = ANY("${column}")`,
            [value],
          );
          count = res.rowCount;
        }
        grandTotal += count;
        if (count > 0) {
          console.log(
            `  ${table}.${column} [${kind}] value=${JSON.stringify(value)}: ${count} row(s)${dryRun ? ' would change' : ' changed'}`,
          );
        }
      }
    }
    console.log(
      `${dryRun ? '[DRY RUN] Total rows that would change' : 'Total rows changed'}: ${grandTotal}`,
    );
    if (dryRun) console.log('Dry run only — nothing was changed. Re-run without --dry-run to apply.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Cleanup failed:', err.message);
  process.exit(1);
});
