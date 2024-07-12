/**
 * 该文件用于定义每次对n个字节进行的操作
 */

import { Property } from "../types/parse-nalu";
import { generateUUID } from "./generate-uuid";
import { add_prefix_zero_bit } from "./hadle-binary";

/**
 * 跳过n个字节的读取
 * @param param nalu: number[]; readByteIndex: number; 注：readByteIndex 开始读取nalu的下标
 * @param n 跳过的位数
 * @returns
 */
export function skip_n_bytes(param: { nalu: number[]; readByteIndex: number; }, n: number) {
  // 改变param里面的readByteIndex用于接下来字节的读取
  param.readByteIndex += n;

}

/**
 * 查看剩余的bytes还有多少
 * @param param nalu: number[]; readByteIndex: number; 注：readByteIndex 开始读取nalu的下标
 * @returns
 */
export function bytestream2_get_bytes_left(param: { nalu: number[]; readByteIndex: number; }) {
  return param.nalu.length - param.readByteIndex;
}

/**
 * 读取n位数据，不改变param.readByteIndex的值
 * @param param nalu: number[]; readByteIndex: number; 注：readByteIndex 开始读取nalu的下标
 * @param n 需要读取的位数
 * @returns
 */
export function bytestream2_peek_le_n_bits(param: { nalu: number[]; readByteIndex: number; }, n: number) {
  const readByteIndex = param.readByteIndex;
  let i;
  let binaryString = '';
  const readByteNum = n / 8; // 需要读取的字节数
  const lastReadByteIndex = readByteIndex + readByteNum - 1;
  // 判断是否数组读取已经超出了数组的大小
  if (lastReadByteIndex >= param.nalu.length) return 0;
  for (i = 0; i < readByteNum; i++) {
    // 数据是小端放置的，所以读取的时候应该反向获取
    const tempBinaryString = param.nalu[lastReadByteIndex - i].toString(2);
    binaryString += add_prefix_zero_bit(tempBinaryString, 8 - tempBinaryString.length);
  }

  return parseInt(i === 0? '0' : binaryString, 2)
}

/**
 * 读取n位数据，不改变param.readByteIndex的值
 * @param param nalu: number[]; readByteIndex: number; 注：readByteIndex 开始读取nalu的下标
 * @param n 需要读取的位数
 * @returns
 */
export function bytestream2_peek_n_bits(param: { nalu: number[]; readByteIndex: number; }, n: number) {
  const readByteIndex = param.readByteIndex;
  let i;
  let binaryString = '';
  const readByteNum = n / 8; // 需要读取的字节数
  const lastReadByteIndex = readByteIndex + readByteNum - 1;
  // 判断是否数组读取已经超出了数组的大小
  if (lastReadByteIndex >= param.nalu.length) return 0;
  for (i = 0; i < readByteNum; i++) {
    // 数据是小端放置的，所以读取的时候应该反向获取
    const tempBinaryString = param.nalu[lastReadByteIndex - i].toString(2);
    binaryString += add_prefix_zero_bit(tempBinaryString, 8 - tempBinaryString.length);
  }

  return parseInt(i === 0? '0' : binaryString, 2)
}

/**
 * 从字节流中读取一个字节的数据，不改变param.readByteIndex的值
 * @param param nalu: number[]; readByteIndex: number; 注：readByteIndex 开始读取nalu的下标
 * @param n 需要读取的位数
 * @returns
 */
export function bytestream2_peek_byte_le(param: { nalu: number[]; readByteIndex: number; }) {
  return bytestream2_peek_le_n_bits(param, 8);
}

/**
 * 从字节流中读取一个字节的数据，不改变param.readByteIndex的值
 * @param param nalu: number[]; readByteIndex: number; 注：readByteIndex 开始读取nalu的下标
 * @param n 需要读取的位数
 * @returns
 */
export function bytestream2_peek_byte(param: { nalu: number[]; readByteIndex: number; }) {
  return bytestream2_peek_n_bits(param, 8);
}

/**
 * 读取n位数据，不改变param.readByteIndex的值
 * @param param nalu: number[]; readByteIndex: number; 注：readByteIndex 开始读取nalu的下标
 * @param n 需要读取的位数
 * @returns
 */
export function bytestream2_get_n_bits(param: { nalu: number[]; readByteIndex: number; }, n: number, title: string): Property {
  const readByteIndex = param.readByteIndex;
  let i = 0;
  let binaryString = '';
  const readByteNum = n / 8; // 需要读取的字节数
  const lastReadByteIndex = readByteIndex + readByteNum - 1;
  // 判断是否数组读取已经超出了数组的大小
  if (lastReadByteIndex < param.nalu.length) {
    for (i = 0; i < readByteNum; i++) {
      const tempBinaryString = param.nalu[readByteIndex + i].toString(2);
      binaryString += add_prefix_zero_bit(tempBinaryString, 8 - tempBinaryString.length);
    }
  }

  const response = {
    title,
    key: generateUUID(),
    value: parseInt(i === 0? '0' : binaryString, 2),
    bits: n,
    startBytes: param.readByteIndex
  }

  // 改变param里面的readByteIndex用于接下来字节的读取
  param.readByteIndex = readByteIndex + readByteNum;

  return response;
}

/**
 * 读取n位数据，不改变param.readByteIndex的值
 * @param param nalu: number[]; readByteIndex: number; 注：readByteIndex 开始读取nalu的下标
 * @param n 需要读取的位数
 * @returns
 */
export function bytestream2_get_string_n_bits(param: { nalu: number[]; readByteIndex: number; }, n: number, title: string): Property {
  const readByteIndex = param.readByteIndex;
  let i = 0;
  let binaryString = '';
  const readByteNum = n / 8; // 需要读取的字节数
  const lastReadByteIndex = readByteIndex + readByteNum - 1;
  // 判断是否数组读取已经超出了数组的大小
  if (lastReadByteIndex < param.nalu.length) {
    for (i = 0; i < readByteNum; i++) {
      // 数据是小端放置的，所以读取的时候应该反向获取
      const tempBinaryString = param.nalu[readByteIndex + i].toString(16).toUpperCase();
      // binaryString += add_prefix_zero_bit(tempBinaryString, 8 - tempBinaryString.length);
      binaryString += tempBinaryString;
    }
  }

  const response = {
    title,
    key: generateUUID(),
    value: binaryString,
    bits: n,
    startBytes: param.readByteIndex
  }

  // 改变param里面的readByteIndex用于接下来字节的读取
  param.readByteIndex = readByteIndex + readByteNum;

  return response;
}

/**
 * 从字节流中读取一个字节的数据
 * @param param nalu: number[]; readByteIndex: number; 注：readByteIndex 开始读取nalu的下标
 * @param n 需要读取的位数
 * @returns
 */
export function bytestream2_get_byte(param: { nalu: number[]; readByteIndex: number; }, title: string): Property {
  return bytestream2_get_n_bits(param, 8, title);
}