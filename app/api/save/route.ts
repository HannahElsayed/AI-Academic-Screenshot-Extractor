import { NextRequest, NextResponse } from 'next/server';
import { getSaveService } from '@/lib/save/save-service';
import type { SaveRequestPayload, SaveResponse } from '@/types/academic';

export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<NextResponse<SaveResponse>> {
  let payload: SaveRequestPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json<SaveResponse>({ success: false, error: 'Invalid request body.' }, { status: 400 });
  }

  if (!payload?.data || !Array.isArray(payload.data.semesters)) {
    return NextResponse.json<SaveResponse>(
      { success: false, error: 'No academic data was provided to save.' },
      { status: 400 }
    );
  }

  try {
    const saveService = getSaveService();
    const record = await saveService.save(payload.data);
    return NextResponse.json<SaveResponse>({ success: true, recordId: record.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save the record.';
    return NextResponse.json<SaveResponse>({ success: false, error: message }, { status: 500 });
  }
}
