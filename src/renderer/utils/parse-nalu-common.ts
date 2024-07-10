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