import { NextResponse } from 'next/server';
import { getPhaseDispatchSchedule, getDispatchSchedule } from '@/lib/database';

export async function GET() {
  try {
    const phase = getPhaseDispatchSchedule();  // authoritative: based on Dispatch phase end_date
    const dpr   = getDispatchSchedule();        // execution: based on DPR entry dates

    return NextResponse.json({
      phase_based: phase,   // what SHOULD go out (PERT planning)
      dpr_based:   dpr,     // what is LOGGED as going out (execution tracking)
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
