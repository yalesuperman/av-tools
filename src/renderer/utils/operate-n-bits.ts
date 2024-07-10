/**
 * 该文件用于定义每次对n个bits进行的操作
 */
import { add_prefix_zero_bit } from './hadle-binary';
import { generateUUID } from './generate-uuid';
import { Property } from '../types/parse-nalu';

/**
 * 跳过n个bit的读取
 * @param param nalu: number[]; readBitIndex: number; 注：readBitIndex 开始读取nalu的下标
 * @param n 跳过的位数
 * @returns
 */
export function skip_n_bits(param: { nalu: number[]; readBitIndex: number; }, n: number) {
  // 改变param里面的readBitIndex用于接下来字节的读取
  param.readBitIndex += n;

}

/**
 * 读取n个bit，并获得它们表示的值
 * @param param nalu: number[]; readBitIndex: number; 注：readBitIndex 开始读取nalu的下标
 * @param n 跳过的位数
 * @returns
 */
export function get_n_bits(param: { nalu: number[]; readBitIndex: number; }, n: number, title: string): Omit<Property, 'value'> & { value: number } {
  let readBitIndex = param.readBitIndex;
  let i;
  let binaryString = '';
  const remainder = readBitIndex % 8;
  const readByteNum = remainder ? Math.ceil(n / 8) + 1 : Math.ceil(n / 8); // 如果有余数，说明读取位的下标位于一个字节的中间，那么就需要多取一个字节
  const startBytes = Math.floor(readBitIndex / 8);
  for (i = 0; i < readByteNum; i++) {
    // 判断是否数组读取已经超出了数组的大小
    if ((startBytes + i) >= param.nalu.length) break;

    const tempBinaryString = param.nalu[startBytes + i].toString(2);
    binaryString += add_prefix_zero_bit(tempBinaryString, 8 - tempBinaryString.length);
  }

  readBitIndex += n;

  const response = {
    title,
    key: generateUUID(),
    value: parseInt(i === 0? '0' : binaryString.slice(remainder, remainder + n), 2),
    bits: readBitIndex - param.readBitIndex,
    startBytes
  }

  // 改变param里面的readBitIndex用于接下来字节的读取
  param.readBitIndex = readBitIndex;

  return response;
}

/**
 * 只是显示n个bit的值，不进行readBitIndex的变化
 * @param param nalu: number[]; readBitIndex: number; 注：readBitIndex 开始读取nalu的下标
 * @param n 需要显示的位数
 * @returns
 */
export function show_n_bits(param: { nalu: number[]; readBitIndex: number; }, n: number): number {
  const readBitIndex = param.readBitIndex;
  let i;
  let binaryString = '';
  const remainder = readBitIndex % 8;
  const readByteNum = remainder ? Math.ceil(n / 8) + 1 : Math.ceil(n / 8); // 如果有余数，说明读取位的下标位于一个字节的中间，那么就需要多取一个字节
  const startBytes = Math.floor(readBitIndex / 8);
  for (i = 0; i < readByteNum; i++) {
    // 判断是否数组读取已经超出了数组的大小
    if ((startBytes + i) >= param.nalu.length) break;

    const tempBinaryString = param.nalu[startBytes + i].toString(2);
    binaryString += add_prefix_zero_bit(tempBinaryString, 8 - tempBinaryString.length);
  }

  return parseInt(i === 0? '0' : binaryString.slice(remainder, remainder + n), 2);
}

/**
 * 查看剩余的bits还有多少
 * @param param nalu: number[]; readBitIndex: number; 注：readBitIndex 开始读取nalu的下标
 * @returns
 */
export function get_bits_left(param: { nalu: number[]; readBitIndex: number; }): number {
  return param.nalu.length * 8 - param.readBitIndex;
}
