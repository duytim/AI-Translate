import { StorageService } from './storage.js';

const API_KEY =
    import.meta.env.VITE_OPENROUTER_API_KEY;

const FALLBACK_MODELS = [
    "z-ai/glm-4.5-air:free",
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "moonshotai/kimi-k2.6:free",
    "nousresearch/hermes-3-llama-3.1-405b:free",
    "google/gemma-4-31b-it:free"
];

function timeoutPromise(ms) {
    return new Promise((_, reject) =>
        setTimeout(
            () => reject(
                new Error('timeout')
            ),
            ms
        )
    );
}

export async function translateText(
    text,
    targetLangCode,
    userSelectedModel,
    onComplete
) {

    const cacheKey =
        `${targetLangCode}_${text}`;

    const cached =
        StorageService.getCache(cacheKey);

    if (cached) {
        onComplete(cached);
        return;
    }

    const langMap = {
        zh: 'tiếng Trung',
        ko: 'tiếng Hàn',
        ja: 'tiếng Nhật',
        en: 'tiếng Anh',
        vi: 'tiếng Việt'
    };

    const targetLangName =
        langMap[targetLangCode] ||
        'tiếng Trung';

    const SYSTEM_PROMPT = `
Bạn là phiên dịch viên chuyên nghiệp đa ngôn ngữ.

Nhiệm vụ:

* Hiểu chính xác ý định của người viết.
* Dịch sang ngôn ngữ đích theo cách người bản xứ thực sự sử dụng trong giao tiếp hàng ngày và công việc.
* Ưu tiên tự nhiên, dễ hiểu, lịch sự và đúng văn cảnh.
* Không dịch từng từ một nếu cách diễn đạt đó không tự nhiên.
* Có thể thay đổi cấu trúc câu để câu dịch tự nhiên hơn nhưng không được làm thay đổi ý nghĩa.
* Giữ nguyên mục đích, sắc thái và mức độ lịch sự của người viết.

Quy tắc:

1. Nếu nội dung là trò chuyện:

   * Dịch như người bản xứ đang nhắn tin.
   * Không dùng văn phong sách giáo khoa.

2. Nếu nội dung là công việc:

   * Dịch theo văn phong doanh nghiệp chuyên nghiệp.
   * Lịch sự nhưng không quá cứng nhắc.

3. Nếu nội dung là câu hỏi:

   * Giữ nguyên ý hỏi.
   * Không tự ý thêm thông tin.

4. Tên riêng:

   * Giữ nguyên.

5. Số điện thoại:

   * Giữ nguyên.

6. Link:

   * Giữ nguyên.

7. Mã đơn hàng:

   * Giữ nguyên.

8. Emoji:

   * Giữ nguyên.

9. Xuống dòng:

   * Giữ nguyên.

10. Không được giải thích.

11. Không được bình luận.

12. Không được thêm nội dung ngoài bản dịch.

BẮT BUỘC trả JSON hợp lệ:

{
"detected_source_language": "",
"original": "",
"phonetic": "",
"translation": "",
"translation_style": ""
}

translation_style:

* casual
* business
* formal

`;

    let modelsToTry = [userSelectedModel];

    for (const model of FALLBACK_MODELS) {

        if (model !== userSelectedModel) {
            modelsToTry.push(model);
        }
    }

    for (const model of modelsToTry) {

        try {

            const response =
                await Promise.race([
                    fetch(
                        "https://openrouter.ai/api/v1/chat/completions",
                        {
                            method: "POST",
                            headers: {
                                Authorization:
                                    `Bearer ${API_KEY}`,
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                model,
                                messages: [
                                    {
                                        role: "system",
                                        content:
                                            SYSTEM_PROMPT
                                    },
                                    {
                                        role: "user",
                                        content:
                                            `Dịch sang ${targetLangName}: ${text}`
                                    }
                                ],
                                temperature: 0.1
                            })
                        }
                    ),
                    timeoutPromise(12000)
                ]);

            if (!response.ok) {
                throw new Error(
                    response.status
                );
            }

            const data =
                await response.json();

            let result =
                data.choices[0]
                .message.content
                .trim();

            result = result
                .replace(/^```json/i, '')
                .replace(/^```/, '')
                .replace(/```$/, '')
                .trim();

            const json =
                JSON.parse(result);

            json._used_model =
                model;

            StorageService.saveCache(
                cacheKey,
                json
            );

            onComplete(json);

            return;

        } catch (e) {

            console.warn(
                `${model} failed`,
                e
            );
        }
    }

    onComplete(null);
}