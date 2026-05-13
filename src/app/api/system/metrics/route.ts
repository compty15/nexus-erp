import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Fetch System Metrics (Cost, Tokens, Rows)
    const { data: metrics, error } = await supabase
      .from('system_metrics')
      .select('*');

    if (error) throw error;

    // 2. Calculate current status
    const healthData = metrics.map(m => ({
      name: m.metric_name,
      value: m.current_value,
      limit: m.daily_limit,
      percentage: (m.current_value / m.daily_limit) * 100,
      status: (m.current_value / m.daily_limit) > (m.alert_threshold || 0.8) ? 'warning' : 'healthy'
    }));

    // 3. Row Count Check (Supabase Guardrail)
    const { count: rowCount } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      health: healthData,
      database: {
        inventory_rows: rowCount,
        limit: 50000, // Example Supabase free tier limit
      },
      should_switch_to_lite: healthData.some(h => h.name === 'api_cost' && h.status === 'warning')
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
