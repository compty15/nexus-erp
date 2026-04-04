import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
    const unitsDir = path.join(process.cwd(), '../units');
    const files = fs.readdirSync(unitsDir);
    const units = files.filter(f => f.endsWith('.json')).map(f => {
        const content = fs.readFileSync(path.join(unitsDir, f), 'utf-8');
        return JSON.parse(content);
    });
    return NextResponse.json(units);
}
