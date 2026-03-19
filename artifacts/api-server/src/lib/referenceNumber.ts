import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

export async function generateIncidentRef(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `SS-${year}-`;
  const result = await db.execute(sql`
    SELECT reference_number FROM incidents 
    WHERE reference_number LIKE ${prefix + '%'} 
    ORDER BY reference_number DESC LIMIT 1
  `);
  const last = (result.rows[0] as any)?.reference_number;
  let next = 1;
  if (last) {
    const num = parseInt(last.replace(prefix, ""), 10);
    if (!isNaN(num)) next = num + 1;
  }
  return `${prefix}${String(next).padStart(4, "0")}`;
}

export async function generateProtocolRef(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `PROT-${year}-`;
  const result = await db.execute(sql`
    SELECT reference_number FROM protocols 
    WHERE reference_number LIKE ${prefix + '%'} 
    ORDER BY reference_number DESC LIMIT 1
  `);
  const last = (result.rows[0] as any)?.reference_number;
  let next = 1;
  if (last) {
    const num = parseInt(last.replace(prefix, ""), 10);
    if (!isNaN(num)) next = num + 1;
  }
  return `${prefix}${String(next).padStart(3, "0")}`;
}
