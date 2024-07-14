/**
 * 对类型为SPS扩展的NAL Unit的数据进行解析，解析出字节所表示的含义
 */
import { generateUUID } from './generate-uuid';
import { Property } from '../types/parse-nalu';
import { get_ue_golomb } from './golomb';
import { get_n_bits } from './operate-n-bits';
import { getNaluCommonStruct } from './parse-nalu-common';
import { RBSPSyntaxStructureMap } from '../types/nal-unit-types';


export function handleSPSExt(nalu: number[]): Property[] {
  // 从8字节的位置开始读其他的信息，换算成bit位置的话是64
  const params = {
    nalu,
    readBitIndex: 40
  }
  const nal_unit_type = nalu[4] & 0x1f;
  
  const rbspChildren: Property[] = [];

  rbspChildren.push(get_ue_golomb(params, 'seq_parameter_set_id'));
  const aux_format_idc = get_ue_golomb(params, 'aux_format_idc');

  if (aux_format_idc.value !== 0) {
    const bit_depth_aux_minus8 = get_ue_golomb(params, 'bit_depth_aux_minus8');
    rbspChildren.push(bit_depth_aux_minus8);
    rbspChildren.push(get_n_bits(params, 1, 'alpha_incr_flag'));
    rbspChildren.push(get_n_bits(params, bit_depth_aux_minus8.value + 9, 'alpha_opaque_value'));
    rbspChildren.push(get_n_bits(params, bit_depth_aux_minus8.value + 9, 'alpha_transparent_value'));
  }

  rbspChildren.push(get_n_bits(params, 1, 'additional_extension_flag'));

  rbspChildren.push({
    key: generateUUID(),
    title: 'rbsp_trailing_bits',
    startBytes: Math.floor(params.readBitIndex / 8),
    bits: 'N/A',
    children: [],
  });

  return [
    ...getNaluCommonStruct(nalu),
    {
      key: generateUUID(),
      title: RBSPSyntaxStructureMap[nal_unit_type],
      startBytes: 5,
      bits: 'N/A',
      children: rbspChildren,
    },
  ];
}