export const SpeechService = {
    speak: (text, langCode) => {
        if (!text) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Map mã ngôn ngữ cho TTS
        const langMapTTS = { 
            'zh': 'zh-CN', 'ko': 'ko-KR', 'ja': 'ja-JP', 
            'en': 'en-US', 'vi': 'vi-VN', 'auto': 'vi-VN' 
        };
        utterance.lang = langMapTTS[langCode] || 'vi-VN';
        utterance.rate = 0.9; 
        
        window.speechSynthesis.speak(utterance);
    },

    listen: (sourceLang, onResult, onEnd) => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Trình duyệt không hỗ trợ nhận diện giọng nói.");
            return null;
        }

        const recognition = new SpeechRecognition();
        const langMapSTT = { 'zh': 'zh-CN', 'ko': 'ko-KR', 'ja': 'ja-JP', 'en': 'en-US', 'vi': 'vi-VN' };
        recognition.lang = langMapSTT[sourceLang] || 'vi-VN';
        recognition.interimResults = true;

        recognition.onresult = (event) => {
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) final += event.results[i][0].transcript;
            }
            if (final) onResult(final);
        };

        recognition.onend = onEnd;
        recognition.start();
        return recognition;
    }
};