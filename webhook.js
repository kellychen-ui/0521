const line = require('@line/bot-sdk');

const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(200).send('LineBot Webhook is running...');
    }

    const signature = req.headers['x-line-signature'];
    if (!signature) {
        return res.status(401).send('No signature');
    }

    try {
        const events = req.body.events;
        await Promise.all(events.map(handleEvent));
        res.status(200).send('OK');
    } catch (err) {
        console.error(err);
        res.status(500).end();
    }
};

async function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }

    const userMessage = event.message.text.trim();
    let replyText = "";

    // 判斷是否為圖文選單 A 區所觸發的普級電影查詢
    if (userMessage.includes('G級電影') || userMessage.includes('普級電影')) {
        replyText = "🎬 為您查詢本週上映的「普級（G級）電影」結果：\n\n1. 《夏日貓咪物語》- 溫馨治癒首選！\n2. 《玩具總動員 5》- 經典動畫回歸。\n3. 《冰雪奇緣：番外篇》- 全家大小適合觀看。";
    } else if (userMessage.includes('天氣')) {
        replyText = "☀️ 今日台中天氣晴朗，氣溫約 27°C，適合出門看電影喔！";
    } else {
        replyText = `我是電影機器人，頭好壯壯。您說了：「${userMessage}」，您可以點擊下方的圖文選單來查詢電影或天氣喔！`;
    }

    return client.replyMessage(event.replyToken, {
        type: 'text',
        text: replyText
    });
}