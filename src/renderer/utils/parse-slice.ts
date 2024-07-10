/**
 * 对类型为SEI的NAL Unit的数据进行解析，解析出字节所表示的含义
 */
import { Property } from '../types/parse-nalu';
import { findNALTreeProperty, getNaluCommonStruct } from './parse-nalu-common';
import { generateUUID } from './generate-uuid';
import { get_ue_golomb, get_ue_golomb_long } from './golomb';
import { ff_h264_golomb_to_pict_type } from '../types/pict-types';
import { get_n_bits } from './operate-n-bits';

export function handleSlice(nalu: number[], sps: Property[]): Property[] {
  // 从5字节的位置开始读其他的信息，换算成bit位置的话是40
  const params = {
    nalu,
    readBitIndex: 40
  }
  const parseResult: Property[] = [
    ...getNaluCommonStruct(nalu),
  ];

  const slice_header: Property[] = [];

  parseResult.push({
    key: generateUUID(),
    title: 'slice_header',
    startBytes: 5,
    bits: 'N/A',
    children: slice_header,
  });

  slice_header.push(get_ue_golomb_long(params, 'first_mb_in_slice'))

  const slice_type = get_ue_golomb(params, 'slice_type'); // 由slice_type的值可以得到pict_type

  slice_header.push(slice_type);

  const pic_parameter_sequence_id = get_ue_golomb(params, 'pic_parameter_sequence_id');
  slice_header.push(pic_parameter_sequence_id);

  const log2_max_frame_num_minus4 = findNALTreeProperty(sps, 'log2_max_frame_num_minus4') as Property;

  console.log(log2_max_frame_num_minus4, 'log2_max_frame_num_minus4')
  const frame_num = get_n_bits(params, (log2_max_frame_num_minus4.value) as number + 4, 'frame_num');

  slice_header.push(frame_num);

  return parseResult;
}

/**
 * 从NALU中获取pict_type
 * @param nalu 
 * @returns 
 */
export function getSlicePictType(nalu: number[]): string {
  // 从5字节的位置开始读其他的信息，换算成bit位置的话是40
  const params = {
    nalu,
    readBitIndex: 40
  }

  get_ue_golomb_long(params, 'first_mb_in_slice');

  const slice_type = get_ue_golomb(params, 'slice_type'); // 由slice_type的值可以得到pict_type
  return ff_h264_golomb_to_pict_type[slice_type.value % 5];
}