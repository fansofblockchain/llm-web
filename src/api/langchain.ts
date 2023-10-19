interface ChatModel {
  history: HistoryItem[];
  id: string;
  question: string;
  is_query?: boolean;
  model?: string;
}

interface HistoryItem {
  role: "user" | "assistant";
  content: string;
}

function debounce(func: Function, delay: number) {
  let timeoutId: any;

  return (...args: any) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      // @ts-ignore
      func.apply(this, args);
    }, delay);
  };
}

// 创建一个接收 Response event stream 的方法
export default async function getResponseEventStream(
  data: ChatModel,
  getChunk: Function
) {
  try {
    const response: any = await fetch(
      "http://web.responds.top/api/demo/get_lang",
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
    let newChunk = "";

    async function readData() {
      try {
        const result = await reader.read();
        // 处理数据块，将其转换为字符串
        const chunk = new TextDecoder("utf-8").decode(result.value);
        // console.log("chunk>>>", chunk);
        if (result.done) {
          console.log("Response event stream ended.");
          setTimeout(
            () => getChunk(null, result.done ? "ended" : "loading"),
            0
          );
          return;
        } else {
          try {
            if (data.model === "v2") {
              if (chunk) {
                let index = chunk.lastIndexOf("start:>>>");
                newChunk = chunk.slice(index + 9, chunk.length);
              }

              newChunk &&
                getChunk(
                  newChunk
                    .replace("('role', 'assistant', '", "")
                    .replace("('role', 'assistant", "")
                    .replace("('content', '", "")
                    .replace("')", ""),
                  result.done ? "ended" : "loading"
                );
            } else {
              if (chunk) {
                getChunk(
                  JSON.parse(newChunk).choices[0].text,
                  result.done ? "ended" : "loading"
                );
              }
            }
          } catch (error) {
            console.log("error:对象不是一个json对象");
          }
        }
        // 继续读取
        setTimeout(() => readData(), 0);
      } catch (error) {
        getChunk(
          `<font color="#660000"> Error:  服务器发生错误 </font>`,
          "ended"
        );
      }
    }

    readData();
  } catch (error: any) {
    console.log("error", error);
    return error;
  }
}
