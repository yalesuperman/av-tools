/**
 * 对二进制数据进行处理
 */

/**
 * 向二进制字符串前面添加count个0
 * @param binaryString 二进制字符串
 * @param count 添加0的数量
 * @returns 添加完0后的二进制字符串
 */
export function add_prefix_zero_bit(binaryString: string, count: number) {
  for (let i = 0; i < count; i++) {
    // eslint-disable-next-line no-param-reassign
    binaryString = `0${  binaryString}`;
  }
  return binaryString;
}