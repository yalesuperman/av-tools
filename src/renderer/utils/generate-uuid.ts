export function generateUUID(): string {
  // 使用当前时间的毫秒值作为UUID的一部分
  const timestamp = Date.now().toString(16);
  // 生成随机数作为UUID的另一部分
  const randomPart = Math.random() * 10 + Math.floor((Math.random() * 0x10000) + 0x1000).toString(16).substring(1);
  // 组合时间戳和随机数，形成UUID
  const uuid = timestamp + randomPart;
  return uuid;
}