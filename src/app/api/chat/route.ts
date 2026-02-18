import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Timeout for DeepSeek API calls (20 seconds - slightly less than Netlify's 25s edge timeout)
const DEEPSEEK_API_TIMEOUT = 20000; // 20 seconds in milliseconds

export async function POST(req: NextRequest) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEEPSEEK_API_TIMEOUT);

    try {
        const { messages } = await req.json();

        if (!process.env.DEEPSEEK_API_KEY) {
            console.error('DeepSeek API Key is missing in environment variables');
            return NextResponse.json({
                error: {
                    message: 'API Key is not configured. Please add DEEPSEEK_API_KEY to .env.local and RESTART the dev server.',
                    code: 'API_KEY_MISSING'
                }
            }, { status: 500 });
        }

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages,
                stream: true,
            }),
            signal: controller.signal,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('DeepSeek API Error:', errorText);

            // Special handling for rate limiting (429) and quota errors
            if (response.status === 429) {
                return NextResponse.json({
                    error: {
                        message: 'Rate limit exceeded. Please try again later.',
                        code: 'RATE_LIMIT_ERROR'
                    }
                }, { status: 429 });
            }

            // Check for quota errors in the response text
            if (errorText.toLowerCase().includes('quota') || errorText.toLowerCase().includes('insufficient')) {
                return NextResponse.json({
                    error: {
                        message: 'API quota exhausted. Please check your DeepSeek account balance.',
                        code: 'QUOTA_EXHAUSTED'
                    }
                }, { status: response.status });
            }

            try {
                const errorJson = JSON.parse(errorText);
                return NextResponse.json({
                    error: {
                        ...(errorJson.error || errorJson),
                        code: 'DEEPSEEK_API_ERROR'
                    }
                }, { status: response.status });
            } catch (e) {
                return NextResponse.json({
                    error: {
                        message: errorText || 'Unknown API Error',
                        code: 'UNKNOWN_API_ERROR'
                    }
                }, { status: response.status });
            }
        }

        // Proxy the stream
        clearTimeout(timeoutId); // Clear timeout on successful response start
        return new Response(response.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error: any) {
        let errorCode = 'INTERNAL_SERVER_ERROR';
        let errorMessage = error.message;
        let statusCode = 500;

        // Handle specific error types
        if (error.name === 'AbortError' || error.message.includes('aborted')) {
            errorCode = 'TIMEOUT_ERROR';
            errorMessage = 'DeepSeek API request timed out after 20 seconds';
            statusCode = 504; // Gateway Timeout
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
            errorCode = 'NETWORK_ERROR';
            errorMessage = 'Network error connecting to DeepSeek API';
        }

        console.error(`DeepSeek API Route Error [${errorCode}]:`, error.message);

        return NextResponse.json({
            error: {
                message: errorMessage,
                code: errorCode
            }
        }, { status: statusCode });
    } finally {
        clearTimeout(timeoutId); // Ensure timeout is always cleared
    }
}
