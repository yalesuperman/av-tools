/**
 * 对类型为PPS的NAL Unit的数据进行解析，解析出字节所表示的含义
 */
import { generateUUID } from './generate-uuid';
import { Property } from '../types/parse-nalu';
import { get_ue_golomb, get_se_golomb } from './golomb';
import { get_n_bits, get_bits_left } from './operate-n-bits';
import { getNaluCommonStruct } from './parse-nalu-common';

function more_rbsp_data_in_pps(sps: Property[])
{
  const profile_idc = (sps[3].children as Property[])[0].value;
  const constraint_set0_flag = (sps[3].children as Property[])[1].value as number;
  const constraint_set1_flag = (sps[3].children as Property[])[2].value as number;
  const constraint_set2_flag = (sps[3].children as Property[])[3].value as number;
  const constraint_set3_flag = (sps[3].children as Property[])[4].value as number;
  const constraint_set4_flag = (sps[3].children as Property[])[5].value as number;
  const constraint_set5_flag = (sps[3].children as Property[])[6].value as number;
  let constraint_set_flags = 0;
  constraint_set_flags |= constraint_set0_flag << 0;   // constraint_set0_flag
  constraint_set_flags |= constraint_set1_flag << 1;   // constraint_set1_flag
  constraint_set_flags |= constraint_set2_flag << 2;   // constraint_set2_flag
  constraint_set_flags |= constraint_set3_flag << 3;   // constraint_set3_flag
  constraint_set_flags |= constraint_set4_flag << 4;   // constraint_set4_flag
  constraint_set_flags |= constraint_set5_flag << 5;   // constraint_set5_flag

  if ((profile_idc === 66 || profile_idc === 77 ||
        profile_idc === 88) && (constraint_set_flags & 7)) {
      console.log("Current profile doesn't provide more RBSP data in PPS, skipping");
      return 0;
  }

  return 1;
}

export function handlePPS(nalu: number[], sps: Property[]): Property[] {
  console.log(sps, 3424324234)
  // 从8字节的位置开始读其他的信息，换算成bit位置的话是64
  const params = {
    nalu,
    readBitIndex: 40
  }
  const pic_parameter_set_data: Property[] = [];

  const parseResult: Property[] = [
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

  if (get_bits_left(params) > 0 && more_rbsp_data_in_pps(sps)) {
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