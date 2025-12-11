import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { sendBugReportEmail } from '~/lib/email-service';
import { validateApiKey } from '~/lib/security';

type BugReportRequest = {
  subject: string;
  description: string;
  deviceInfo?: string;
  appVersion?: string;
  userEmail?: string;
};

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Valid API key required' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as BugReportRequest;

    const { subject, description, deviceInfo, appVersion, userEmail } = body;

    // Validate required fields
    if (!subject || !description) {
      return NextResponse.json(
        { error: 'Subject and description are required' },
        { status: 400 }
      );
    }

    // Send bug report email
    let emailSent = false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const result = await sendBugReportEmail({
        subject,
        description,
        deviceInfo,
        appVersion,
        userEmail,
      });
      emailSent = result === true;
    } catch (error) {
      console.error('Error sending bug report email:', error);
      emailSent = false;
    }

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send bug report email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bug report submitted successfully'
    });
  } catch (error) {
    console.error('Error processing bug report:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to process bug report', details: errorMessage },
      { status: 500 }
    );
  }
}

