import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";
import serverConfig from "../../serverConfig"; //引入配置项文件

class RetriableError extends Error {}
class FatalError extends Error {}
export interface ChatModel {
  history: HistoryItem[];
  id: string;
  question: string;
  is_query?: boolean;
  model?: string;
  topic_id?: number;
  table_name?: string;
}

interface HistoryItem {
  role: "user" | "assistant";
  content: string;
}

const processStream = async (
  response: any,
  getChunk: Function,
  model?: string
) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let partialChunk = "";
  let shouldStop = !getChunk; // 停止读取器的条件
  while (true) {
    const { done, value } = await reader.read();
    if (done || shouldStop) {
      reader.cancel(); // 停止读取器
      break;
    }
    try {
      let newChunk = decoder.decode(value, { stream: true });
      if (model === 'chatgpt' ) {
        const chunk = partialChunk + newChunk;
        const lines = chunk.split("\n");
        let fullContent = "";
        for (let i = 0; i < lines.length - 1; i++) {
          try {
            let item = JSON.parse(lines[i].replace("data: ", ""));
            if (item) {
              fullContent += item.choices[0].delta.content || "";
            }
          } catch (error) {}
        }
        getChunk(fullContent, "loading");

        partialChunk = chunk;
      } else {
        partialChunk += newChunk;
        getChunk(partialChunk, "loading");
      }
      // 根据某个条件判断是否停止读取器
      if (shouldStop) {
        reader.cancel(); // 停止读取器
        break;
      }
    } catch (error) {}
  }
  getChunk(null, "ended");
};

export function prettyObject(msg: any) {
  const obj = msg;
  if (typeof msg !== "string") {
    msg = JSON.stringify(msg, null, "  ");
  }
  if (msg === "{}") {
    return obj.toString();
  }
  if (msg.startsWith("```json")) {
    return msg;
  }
  return ["```json", msg, "```"].join("\n");
}

export async function fetchV2DataStream(data: ChatModel, getChunk: Function) {
  try {
    const response: any = await fetch(
      serverConfig.baseURL + "/api/demo/get_lang",
      {
        method: "POST", // 设置请求方法为 POST
        body: JSON.stringify(data), // 将请求的数据 JSON 格式化
        headers: {
          "Content-Type": "application/json", // 设置 Content-Type 头部
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data stream");
    }

    processStream(response, getChunk, data.model);
  } catch (error) {
    console.error(error);
  }
}

export async function fetchGPTDataStream(data: ChatModel, getChunk: Function) {
  let responseText = "";
  let finished = false;
  const finish = () => {
    if (!finished) {
      getChunk(null, "ended");
      finished = true;
    }
  };
  fetchEventSource(
    "http://web.responds.top/api/demo/get_lang",
    // // @ts-ignore
    // ...chatPayload,
    {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json", // 设置 Content-Type 头部
      },
      async onopen(res: any) {
        const contentType = res.headers.get("content-type");

        if (contentType?.startsWith("text/plain")) {
          responseText = await res.clone().text();
          return finish();
        }

        if (
          !res.ok ||
          !res.headers
            .get("content-type")
            ?.startsWith(EventStreamContentType) ||
          res.status !== 200
        ) {
          const responseTexts = [responseText];
          let extraInfo = await res.clone().text();
          try {
            const resJson = await res.clone().json();
            extraInfo = prettyObject(resJson);
          } catch {}

          if (res.status === 401) {
            responseTexts.push("未授权");
          }

          if (extraInfo) {
            responseTexts.push(extraInfo);
          }

          responseText = responseTexts.join("\n\n");

          return finish();
        }
      },
      onmessage(msg: any) {
        if (msg.data === "[DONE]" || finished) {
          return finish();
        }
        const text = msg.data;
        try {
          const json = JSON.parse(text);
          const delta = json.choices[0].delta.content;
          if (delta) {
            responseText += delta;
            getChunk(responseText, "loading");
          }
        } catch (e) {
          console.error("[Request] parse error", text, msg);
        }
      },
      onclose() {
        finish();
      },
      onerror(err: any) {
        if (err instanceof FatalError) {
          throw err; // rethrow to stop the operation
        } else {
          // do nothing to automatically retry. You can also
          // return a specific retry interval here.
        }
      },
    }
  );
}

export default async function fetchDataStream(
  data: ChatModel,
  getChunk: Function
) {
  // if (data.model === "v2") {
  fetchV2DataStream(data, getChunk);
  // } else {
  //   fetchGPTDataStream(data, getChunk);
  // }
}
