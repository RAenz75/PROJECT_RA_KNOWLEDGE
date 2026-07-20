import { McpServer, ResourceTemplate } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import { pool } from './db.js';
function createServer() {
    const server = new McpServer({
        name: 'mcp-server',
        version: '0.0.1',
    });

    

    server.registerResource('db-schema', 'schema://database', { title: 'Database schema', mimeType: 'application/json' }, async (uri) => {
        const { rows } = await pool.query(`
                SELECT table_name, column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_schema = 'public'
                ORDER BY table_name, ordinal_position
            `);
        return {
            contents: [{
                    uri: uri.toString(),
                    mimeType: 'application/json',
                    text: JSON.stringify(rows, null, 2),
                }],
        };
    });
    server.registerResource('table-schema', new ResourceTemplate('schema://{table}', {
        list: async () => {
            const { rows } = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
            return {
                resources: rows.map((r) => ({
                    uri: `schema://${r.table_name}`,
                    name: r.table_name,
                })),
            };
        },
    }), { title: 'Table schema', mimeType: 'application/json' }, async (uri, { table }) => {
        const { rows } = await pool.query(`SELECT column_name, data_type, is_nullable
                 FROM information_schema.columns
                 WHERE table_schema = 'public' AND table_name = $1
                 ORDER BY ordinal_position`, [table]);
        return {
            contents: [{
                    uri: uri.toString(),
                    mimeType: 'application/json',
                    text: JSON.stringify(rows, null, 2),
                }],
        };
    });
    server.registerTool(
        'query', 
        {
        title: 'Run a read-only SQL query',
        description: 'Executes a SELECT statement against the database and returns the rows.',
        inputSchema: z.object({ sql: z.string() }),
    }, async ({ sql }) => {
        if (!/^\s*select\b/i.test(sql)) {
            throw new Error('Only SELECT statements are allowed');
        }
        const { rows } = await pool.query(sql);
        return {
            content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }],
        };
    });

    server.registerTool(
    'insert-row',
    {
        title: 'Insert a row',
        description: 'Insert a row into a table',
        inputSchema: z.object({
            table: z.string(),
            values: z.record(z.string(), z.unknown()),
        }),
    },
    async ({ table, values }) => {
        const columns = Object.keys(values)
        const placeholders = columns.map((_, i) => `$${i + 1}`)
        const { rows } = await pool.query(
            `INSERT INTO ${JSON.stringify(table)} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
            Object.values(values)
        )
        return { content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }] }
    }
)

 

    return server;
}
serveStdio(createServer);
