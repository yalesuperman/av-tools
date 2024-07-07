import { generateUUID } from "./generate-uuid";

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