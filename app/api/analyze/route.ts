import { NextResponse } from 'next/server';

/**
 * App RouterにおけるAPIルートの定義。
 * HTTPメソッドに対応する名前付き関数をエクスポートします。
 * @param request - クライアントからのリクエストオブジェクト
 */
export async function POST(request: Request) {
    try {
        // フロントエンドから送信されたAPIキーと画像データを取得
        const { image, apiKey } = await request.json();

        if (!image || !apiKey) {
            return NextResponse.json(
                { error: 'Image data and API Key are required.' },
                { status: 400 }
            );
        }

        const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

        const visionResponse = await fetch(visionApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                requests: [
                    {
                        image: {
                            content: image,
                        },
                        features: [
                            {
                                type: 'FACE_DETECTION',
                                maxResults: 1,
                            },
                        ],
                    },
                ],
            }),
        });

        const visionResult = await visionResponse.json();

        if (!visionResponse.ok) {
            console.error('Google Vision API error:', visionResult);
            // エラー詳細をフロントエンドに返す
            return NextResponse.json(
                {
                    message: 'Google Vision API request failed.',
                    details: visionResult,
                },
                { status: visionResponse.status }
            );
        }

        return NextResponse.json(visionResult);

    } catch (error) {
        console.error('Error in /api/analyze:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
} 