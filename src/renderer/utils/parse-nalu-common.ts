import { generateUUID } from "./generate-uuid";
import { Property  } from '../types/parse-nalu';

export function getNaluCommonStruct(nalu: number[]) {
  return [
    {
      key: generateUUID(),
      value: (nalu[4] & 0x80) >> 7,
      bits: 1,
      startBytes: 4,
      title: 'forbidden_zero_bit'
    },
    {
      key: generateUUID(),
      value: (nalu[4] & 0x60) >> 5,
      bits: 2,
      startBytes: 4,
      title: 'nal_ref_idc'
    },
    {
      key: generateUUID(),
      value:  nalu[4] & 0x1f,
      bits: 5,
      startBytes: 4,
      title: 'nal_unit_type'
    },
  ]
}

/**
 * 从解析好的NAL树形数据结构中查找某个title的数据
 * @param nalTreeData 
 * @param propertyTitle 
 * @returns 
 */
export function findNALTreeProperty(nalTreeData: Property[], propertyTitle: string): Property | -1 {
  for (let i = 0; i < nalTreeData.length; i++) {
    if (nalTreeData[i].children) {
      const result: Property | -1 = findNALTreeProperty(nalTreeData[i].children as Property[], propertyTitle);
      if (result !== -1) return result;
    }
    if (nalTreeData[i].title === propertyTitle) {
      return nalTreeData[i];
    }
  }
  return -1;
}

/**
 * 根据参数序列集数据得到ChromaArrayType值
 * @param sps 参数序列集数据
 * @returns 
 */
export function getChromaArrayType(sps: Property[]) {
  const chroma_format_idc = findNALTreeProperty(sps, 'chroma_format_idc') as Property;
  const separate_colour_plane_flag = findNALTreeProperty(sps, 'separate_colour_plane_flag');
  const ChromaArrayType = separate_colour_plane_flag === -1 ? chroma_format_idc.value : separate_colour_plane_flag.value === 0 ? chroma_format_idc.value : 0;
  return ChromaArrayType;
}