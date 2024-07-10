import { add_prefix_zero_bit } from './hadle-binary';
import { generateUUID } from './generate-uuid';
import { Property } from '../types/parse-nalu';

/**
 * 获取0阶无符号指数哥伦布解码值
 * @param param nalu: number[]; readBitIndex: number; 注：readBitIndex 开始读取nalu的下标
 * @returns
 */
export function get_ue_golomb(param: { nalu: number[]; readBitIndex: number; }, title: string): { value: number } & Omit<Property, 'value'> {
  let readBitIndex = param.readBitIndex;
  let i;
  let binaryString = '';
  const remainder = readBitIndex % 8;
  const readByteNum = remainder ? 5 : 4; // 如果有余数，说明读取位的下标位于一个字节的中间，那么就需要多取一个字节
  const startBytes = Math.floor(readBitIndex / 8);
  for (i = 0; i < readByteNum; i++) {
    // 判断是否数组读取已经超出了数组的大小
    if ((startBytes + i) >= param.nalu.length) break;

    const tempBinaryString = param.nalu[startBytes + i].toString(2);
    binaryString += add_prefix_zero_bit(tempBinaryString, 8 - tempBinaryString.length);
  }

  // 获取前缀0的个数
  for (i = 0; i < 32 && (binaryString[remainder + i] === '0'); i++) {
    readBitIndex++;
  }

  const codeNum = (1 << i) + parseInt(i === 0? '0' : binaryString.slice(remainder + i + 1, remainder + i + 1 + i), 2) - 1;

  readBitIndex += i + 1;

  const response = {
    title,
    key: generateUUID(),
    value: codeNum,
    bits: readBitIndex - param.readBitIndex,
    startBytes,
    descriptor: 'ue(v)'
  }

  // 改变param里面的readBitIndex用于接下来字节的读取
  param.readBitIndex = readBitIndex;

  return response;
}

/**
 * 获取0阶无符号指数哥伦布解码值
 * @param param nalu: number[]; readBitIndex: number; 注：readBitIndex 开始读取nalu的下标
 * @returns
 */
export function get_ue_golomb_long(param: { nalu: number[]; readBitIndex: number; }, title: string): { value: number } & Omit<Property, 'value'> {
  let readBitIndex = param.readBitIndex;
  let i;
  let binaryString = '';
  const remainder = readBitIndex % 8;
  const readByteNum = remainder ? 9 : 8; // 如果有余数，说明读取位的下标位于一个字节的中间，那么就需要多取一个字节
  const startBytes = Math.floor(readBitIndex / 8);
  for (i = 0; i < readByteNum; i++) {
    // 判断是否数组读取已经超出了数组的大小
    if ((startBytes + i) >= param.nalu.length) break;

    const tempBinaryString = param.nalu[startBytes + i].toString(2);
    binaryString += add_prefix_zero_bit(tempBinaryString, 8 - tempBinaryString.length);
  }

  // 获取前缀0的个数
  for (i = 0; i < 64 && (binaryString[remainder + i] === '0'); i++) {
    readBitIndex++;
  }

  const codeNum = (1 << i) + parseInt(i === 0? '0' : binaryString.slice(remainder + i + 1, remainder + i + 1 + i), 2) - 1;

  readBitIndex += i + 1;

  const response = {
    title,
    key: generateUUID(),
    value: codeNum,
    bits: readBitIndex - param.readBitIndex,
    startBytes,
    descriptor: 'se(v)'
  }

  // 改变param里面的readBitIndex用于接下来字节的读取
  param.readBitIndex = readBitIndex;

  return response;
}

/**
 * 获取0阶有符号指数哥伦布解码值
 * @param param nalu: number[]; readBitIndex: number; 注：readBitIndex 开始读取nalu的下标
 * @returns
 */
export function get_se_golomb(param: { nalu: number[]; readBitIndex: number; }, title: string): Omit<Property, 'value'> & { value: number } {
  let readBitIndex = param.readBitIndex;
  let i;
  let binaryString = '';
  const remainder = readBitIndex % 8;
  const readByteNum = remainder ? 5 : 4; // 如果有余数，说明读取位的下标位于一个字节的中间，那么就需要多取一个字节
  const startBytes = Math.floor(readBitIndex / 8);
  for (i = 0; i < readByteNum; i++) {
    // 判断是否数组读取已经超出了数组的大小
    if ((startBytes + i) >= param.nalu.length) break;

    const tempBinaryString = param.nalu[startBytes + i].toString(2);
    binaryString += add_prefix_zero_bit(tempBinaryString, 8 - tempBinaryString.length);
  }

  // 获取前缀0的个数
  for (i = 0; i < 32 && (binaryString[remainder + i] === '0'); i++) {
    readBitIndex++;
  }

  const codeNum = (1 << i) + parseInt(i === 0? '0' : binaryString.slice(remainder + i + 1, remainder + i + 1 + i), 2) - 1;

  readBitIndex += i + 1;

  // 根据有符号数和codeNum的映射规则进行变换
  let result = (codeNum + 1) / 2;

  if (result <= 0 || result !== Math.floor(result)) {
    result = codeNum / -2;
  }

  const response = {
    title,
    key: generateUUID(),
    value: result,
    bits: readBitIndex - param.readBitIndex,
    startBytes,
    variableBits: true
  }

  // 改变param里面的readBitIndex用于接下来字节的读取
  param.readBitIndex = readBitIndex;

  return response;
}