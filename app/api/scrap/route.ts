import { NextResponse, NextRequest } from "next/server";
import pool from '@/config/database';

export async function GET(req: NextRequest) {
    try {
        const result = await pool.query('SELECT * FROM Aluminis');
        
        return NextResponse.json({ 
            success: true, 
            data: result.rows 
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch data from database' 
        }, { status: 500 });
    }
}

