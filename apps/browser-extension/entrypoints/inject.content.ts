import { sendMessage, type WebsiteInfo } from "../lib/message";

function getWebsiteInfo(): WebsiteInfo {
  // 获取标题
  const title = document.title;

  // 获取描述（按优先级）
  let description = '';
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    description = metaDescription.getAttribute('content') || '';
  }
  // 备用：使用第一段文字
  if (!description) {
    const firstParagraph = document.querySelector('p');
    if (firstParagraph) {
      description = firstParagraph.textContent?.trim().slice(0, 200) || '';
    }
  }

  // 获取网站图标（按优先级）
  let ico = '';
  const appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
  const highResIcon = document.querySelector('link[rel="icon"][sizes="32x32"], link[rel="icon"][sizes="192x192"]');
  const defaultIcon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
  
  // 按优先级选择图标
  if (appleIcon) ico = appleIcon.getAttribute('href') || '';
  else if (highResIcon) ico = highResIcon.getAttribute('href') || '';
  else if (defaultIcon) ico = defaultIcon.getAttribute('href') || '';

  // 处理相对路径
  if (ico && !ico.startsWith('http')) {
    if (ico.startsWith('//')) {
      ico = window.location.protocol + ico;
    } else if (ico.startsWith('/')) {
      ico = window.location.origin + ico;
    } else {
      ico = window.location.origin + '/' + ico;
    }
  }

  // 默认 favicon
  if (!ico) {
    ico = window.location.origin + '/favicon.ico';
  }

  return {
    title,
    description,
    ico,
    url: window.location.href
  };
}

export default defineContentScript({
  registration: 'runtime',
  main(ctx) {
    console.log('Script was executed!');

    // onMessage('websiteInfo', async (e) => {
    //   console.log('websiteInfo', e);
    //   // await new Promise(resolve => setTimeout(resolve, 50));
    //   return 'Hello John!'
    // })
    
    sendMessage('websiteInfo', getWebsiteInfo())
  },
});