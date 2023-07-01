// 创建一个接收 Response event stream 的方法
export default async function getResponseEventStream(
  data: any,
  getChunk: Function
) {
  try {
    const response: any = await fetch(
      "http://model.responds.top/v1/chat/completions",
      {
        method: "POST", // 设置请求方法为 POST
        headers: {
          "Content-Type": "application/json", // 设置 Content-Type 头部
        },
        body: JSON.stringify({
          model: "vicuna-13b",
          messages: [{ role: "user", content: "Hello! What is your name?" }],
          stream: true,
          temperature: 0.7,
          top_p: 1.0,
          max_new_tokens: 512,
          stop: "None",
          stop_token_ids: "None",
          echo: false,
          ...data,
        }), // 将请求的数据 JSON 格式化
      }
    );

    // 处理流数据
    const reader = response.body.getReader();

    // 读取数据
    async function readData() {
      const result = await reader.read();

      if (result.done) {
        setTimeout(() => getChunk(null, result.done ? "ended" : "loading"), 0);
        console.log("Response event stream ended.");

        return;
      }
      // 处理数据块，将其转换为字符串
      const chunk = (new TextDecoder('utf-8').decode(result.value));
      // console.log("result.value", result.value);
      console.log("chunk>>>", chunk);
      let chunkData: any[] = [];
      const getChunkData = (chunk: any) => {
        const index = chunk.indexOf("}{");
        if (index > -1) {
          let prechunk = chunk.slice(0, index + 1).replace('\ufffd','');
          chunkData.push(JSON.parse(prechunk));
          let nextchunk = chunk.slice(index + 1);
          if (nextchunk.indexOf("}{") > -1) {
            getChunkData(nextchunk);
          }
        } else {
          chunkData.push(JSON.parse(chunk));
        }
      console.log("chunkData>>>", chunkData);

      };
      getChunkData(chunk);
      getChunk(chunkData, result.done ? "ended" : "loading");

      // 继续读取
      setTimeout(() => readData(), 0);
    }

    readData();
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}
