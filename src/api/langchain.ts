interface ChatModel {
  history: HistoryItem[];
  id: string;
  question: string;
  is_query?: boolean;
}

interface HistoryItem {
  role: "user" | "assistant";
  content: string;
}
// 创建一个接收 Response event stream 的方法
export default async function getResponseEventStream(
  data: ChatModel,
  getChunk: Function
) {
  try {
    const response: any = await fetch(
      "http://model.responds.top/api/demo/get_lang",
      {
        method: "POST", // 设置请求方法为 POST
        body: JSON.stringify(data), // 将请求的数据 JSON 格式化
        headers: {
          "Content-Type": "application/json", // 设置 Content-Type 头部
        },
      }
    );

    // 处理流数据
    const reader = response.body.getReader();

    // 读取数据
    async function readData() {
      try {
        const result = await reader.read();
        // 处理数据块，将其转换为字符串
        const chunk = new TextDecoder("utf-8").decode(result.value);
        console.log("chunk>>>", chunk);

        if (result.done) {
          console.log("Response event stream ended.");
          setTimeout(
            () => getChunk(null, result.done ? "ended" : "loading"),
            0
          );
          return;
        } else {
          let newChunk = chunk;
          if (chunk.indexOf(`}{"text"`) > -1) {
            let index = chunk.lastIndexOf("}{");
            newChunk = chunk.slice(index + 1);
          }
          try {
            getChunk(
              JSON.parse(newChunk).text,
              result.done ? "ended" : "loading"
            );
          } catch (error) {
            console.log("error:对象不是一个json对象");
          }
        }
        // 继续读取
        setTimeout(() => readData(), 0);
      } catch (error) {
        getChunk(`<font color="#660000"> Error:  服务器发生错误 </font>`, "error");
      }
    }

    readData();
  } catch (error: any) {
    console.log("error", error);
    return error;
  }
}
