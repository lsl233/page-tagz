
import * as schema from "./schema/index"
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
export * from "drizzle-orm";


// const pool = postgres(, { max: 1 })


const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema: schema });

