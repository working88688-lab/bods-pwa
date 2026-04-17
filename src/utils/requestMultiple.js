import AbortController from 'abort-controller';

/**
 * 测试一组域名，根据最快完成文件下载的域名。
 * @param {string[]} urls - 域名数组。
 * @param {number} timeout - 超时时间，单位为毫秒。
 * @returns {Promise<string>} 返回最快下载完成的域名或默认的第一个域名。
 */
export default async function getFastestUrl(urls, timeout = 2000) {
  const controllers = urls.map(() => new AbortController());
  let resolved = false;

  const requests = urls.map((url, index) => {
    const controller = controllers[index];

    // 使用 XMLHttpRequest 请求，完整下载文件
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${url}?t=${Date.now()}`, true);
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.setRequestHeader('Pragma', 'no-cache');
      xhr.setRequestHeader('Accept', '*/*');
      xhr.responseType = 'blob';

      // 请求成功完成
      xhr.onload = function () {
        if (xhr.status === 200 && !resolved) {
          resolved = true; // 标记已找到最快的域名
          controllers.forEach((c) => c.abort()); // 取消其他未完成的请求
          resolve(url); // 返回当前域名
        } else {
          resolve(null); // 响应非 200，忽略当前域名
        }
      };

      // 请求失败
      xhr.onerror = function () {
        resolve(null); // 请求失败，忽略当前域名
      };

      // 设置超时
      xhr.timeout = timeout;
      xhr.ontimeout = function () {
        resolve(null); // 请求超时，忽略当前域名
      };

      // 发起请求
      xhr.send();
      
      // 使用 AbortController 中止请求
      controller.signal.addEventListener('abort', () => {
        xhr.abort();
      });
    });
  });

  // 超时逻辑
  const timeoutPromise = new Promise((resolve) =>
    setTimeout(() => {
      controllers.forEach((controller) => controller.abort());
      resolve(null); // 超时返回 null
    }, timeout)
  );

  try {
    const fastestUrl = await Promise.race([...requests, timeoutPromise]);
    return fastestUrl || urls[0]; // 返回最快域名或默认第一个域名
  } catch {
    return urls[0]; // 异常情况下返回第一个域名
  }
}
