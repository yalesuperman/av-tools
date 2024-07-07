/**
 * 对类型为PPS的NAL Unit的数据进行解析，解析出字节所表示的含义
 */
import { generateUUID } from './generate-uuid';
import { Propery } from '../types/parse-nalu';
import { get_ue_golomb, get_se_golomb } from './golomb';
import { get_n_bits, get_bits_left } from './operate-n-bits';
import { getNaluCommonStruct } from './parse-nalu-common';

export function handlePPS(nalu: number[]): Propery[] {
  // 从8字节的位置开始读其他的信息，换算成bit位置的话是64
  const params = {
    nalu,
    readBitIndex: 40
  }
  const pic_parameter_set_data: Propery[] = [];

  const parseResult: Propery[] = [
    ...getNaluCommonStruct(nalu),
    {
      key: generateUUID(),
      title: 'pic_parameter_set_data',
      startBytes: 5,
      bits: 'N/A',
      children: pic_parameter_set_data,
    }
  ]

  const pic_parameter_set_id = get_ue_golomb(params, 'pic_parameter_set_id');
  pic_parameter_set_data.push(pic_parameter_set_id);
  if (pic_parameter_set_id.value >= 256) {
    console.error(`pps_id ${pic_parameter_set_id.value} out of range.`);
    return [];
  }

  pic_parameter_set_data.push(get_ue_golomb(params, 'seq_parameter_set_id'));
  pic_parameter_set_data.push(get_n_bits(params, 1, 'entropy_coding_modde_flag'));
  pic_parameter_set_data.push(get_n_bits(params, 1, 'bottom_field_pic_order_in_frame_present_flag'));

  const num_slice_groups_minus1 = get_ue_golomb(params, 'num_slice_groups_minus1');
  pic_parameter_set_data.push(num_slice_groups_minus1);
  if (num_slice_groups_minus1.value > 1) {
    pic_parameter_set_data.push(get_ue_golomb(params, 'mb_slice_group_map_type'));
    return parseResult;
  }

  const num_ref_idx_10_default_active_minus1 = get_ue_golomb(params, 'num_ref_idx_10_default_active_minus1');
  pic_parameter_set_data.push(num_ref_idx_10_default_active_minus1);
  const num_ref_idx_11_default_active_minus1 = get_ue_golomb(params, 'num_ref_idx_10_default_active_minus1');
  pic_parameter_set_data.push(num_ref_idx_11_default_active_minus1);

  if (num_ref_idx_10_default_active_minus1.value > 31 - 1 || num_ref_idx_11_default_active_minus1.value > 32 - 1) {
    return parseResult;
  }

  pic_parameter_set_data.push(get_n_bits(params, 1, 'weighted_pred_flag'));
  pic_parameter_set_data.push(get_n_bits(params, 2, 'weighted_bipred_idc'));

  pic_parameter_set_data.push(get_se_golomb(params, 'pic_init_qp_minus26'));
  pic_parameter_set_data.push(get_se_golomb(params, 'pic_init_qs_minus26'));

  const chroma_qp_index_offset = get_se_golomb(params, 'chroma_qp_index_offset');
  pic_parameter_set_data.push(chroma_qp_index_offset);
  if (chroma_qp_index_offset.value < -12 || chroma_qp_index_offset.value > 12) {
    return parseResult;
  }

  pic_parameter_set_data.push(get_n_bits(params, 1, 'deblocking_filter_controll_present_flag'));
  pic_parameter_set_data.push(get_n_bits(params, 1, 'constrained_intra_pred_flag'));
  pic_parameter_set_data.push(get_n_bits(params, 1, 'redundant_pic_cnt_present_flag'));

  // TODO：这里还需要有一个根据SPS里面的profile_idc来判断是否有更多的rbsp数据
  if (get_bits_left(params) > 0) {
    pic_parameter_set_data.push(get_n_bits(params, 1, 'transform_8x8_mode_flag'));
    pic_parameter_set_data.push(get_n_bits(params, 1, 'pic_scaling_matrix_present_flag'));

    const second_chroma_qp_index_offset = get_se_golomb(params, 'second_chroma_qp_index_offset');
    pic_parameter_set_data.push(second_chroma_qp_index_offset);
    if (second_chroma_qp_index_offset.value < -12 || second_chroma_qp_index_offset.value > 12) {
      return parseResult;
    }
  } else {
    pic_parameter_set_data.push({
      key: generateUUID(),
      bits: 0,
      startBytes: 'N/A',
      title: 'second_chroma_qp_index_offset',
      value: chroma_qp_index_offset.value
    });
  }

  return parseResult;
}