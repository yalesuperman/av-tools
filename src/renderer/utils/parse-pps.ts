/**
 * 对类型为PPS的NAL Unit的数据进行解析，解析出字节所表示的含义
 */
import { generateUUID } from './generate-uuid';
import { Property } from '../types/parse-nalu';
import { get_ue_golomb, get_se_golomb } from './golomb';
import { get_n_bits, get_bits_left } from './operate-n-bits';
import { findNALTreeProperty, getNaluCommonStruct } from './parse-nalu-common';
import { RBSPSyntaxStructureMap } from '../types/nal-unit-types';

function more_rbsp_data_in_pps(sps: Property[])
{
  const temp = (sps[3] as any).children[0].children as Property[];
  const profile_idc = temp[0].value;
  const constraint_set0_flag = temp[1].value as number;
  const constraint_set1_flag = temp[2].value as number;
  const constraint_set2_flag = temp[3].value as number;
  const constraint_set3_flag = temp[4].value as number;
  const constraint_set4_flag = temp[5].value as number;
  const constraint_set5_flag = temp[6].value as number;
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
  // 从8字节的位置开始读其他的信息，换算成bit位置的话是64
  const params = {
    nalu,
    readBitIndex: 40
  }
  const nal_unit_type = nalu[4] & 0x1f;
  const pic_parameter_set_data: Property[] = [];

  const parseResult: Property[] = [
    ...getNaluCommonStruct(nalu),
    {
      key: generateUUID(),
      title: RBSPSyntaxStructureMap[nal_unit_type],
      startBytes: 5,
      bits: 'N/A',
      children: pic_parameter_set_data,
    }
  ]

  const pic_parameter_set_id = get_ue_golomb(params, 'pic_parameter_set_id');
  pic_parameter_set_data.push(pic_parameter_set_id);

  pic_parameter_set_data.push(get_ue_golomb(params, 'seq_parameter_set_id'));
  pic_parameter_set_data.push(get_n_bits(params, 1, 'entropy_coding_mode_flag'));
  pic_parameter_set_data.push(get_n_bits(params, 1, 'bottom_field_pic_order_in_frame_present_flag'));

  const num_slice_groups_minus1 = get_ue_golomb(params, 'num_slice_groups_minus1');
  pic_parameter_set_data.push(num_slice_groups_minus1);
  if (num_slice_groups_minus1.value > 0) {
    const slice_group_map_type = get_ue_golomb(params, 'slice_group_map_type');
    pic_parameter_set_data.push(slice_group_map_type);
    if (slice_group_map_type.value === 0) {
      for (let i = 0; i <= num_slice_groups_minus1.value; i++)
        pic_parameter_set_data.push(get_ue_golomb(params, `run_length_minus1[${i}]`))
    } else if (slice_group_map_type.value === 2) {
      for (let i = 0; i < num_slice_groups_minus1.value; i++) {
        pic_parameter_set_data.push(get_ue_golomb(params, `top_left[${i}]`));
        pic_parameter_set_data.push(get_ue_golomb(params, `bottom_right[${i}]`));
      }
    } else if (slice_group_map_type.value === 3 || slice_group_map_type.value === 4 || slice_group_map_type.value === 5) {
      pic_parameter_set_data.push(get_n_bits(params, 1, 'slice_group_change_direction_flag'));
      pic_parameter_set_data.push(get_ue_golomb(params, 'slice_group_change_rate_minus1'));
    } else if (slice_group_map_type.value === 6) {
      const pic_size_in_map_units_minus1 = get_ue_golomb(params, 'pic_size_in_map_units_minus1');
      pic_parameter_set_data.push(pic_size_in_map_units_minus1);
      for (let i = 0; i <= pic_size_in_map_units_minus1.value; i++)
        pic_parameter_set_data.push(get_n_bits(params, Math.ceil(Math.log2(num_slice_groups_minus1.value + 1)), `slice_group_id[${i}]`))
      
    }
  }

  const num_ref_idx_l0_default_active_minus1 = get_ue_golomb(params, 'num_ref_idx_l0_default_active_minus1');
  pic_parameter_set_data.push(num_ref_idx_l0_default_active_minus1);
  const num_ref_idx_l1_default_active_minus1 = get_ue_golomb(params, 'num_ref_idx_l1_default_active_minus1');
  pic_parameter_set_data.push(num_ref_idx_l1_default_active_minus1);

  pic_parameter_set_data.push(get_n_bits(params, 1, 'weighted_pred_flag'));
  pic_parameter_set_data.push(get_n_bits(params, 2, 'weighted_bipred_idc'));

  pic_parameter_set_data.push(get_se_golomb(params, 'pic_init_qp_minus26'));
  pic_parameter_set_data.push(get_se_golomb(params, 'pic_init_qs_minus26'));

  const chroma_qp_index_offset = get_se_golomb(params, 'chroma_qp_index_offset');
  pic_parameter_set_data.push(chroma_qp_index_offset);

  pic_parameter_set_data.push(get_n_bits(params, 1, 'deblocking_filter_control_present_flag'));
  pic_parameter_set_data.push(get_n_bits(params, 1, 'constrained_intra_pred_flag'));
  pic_parameter_set_data.push(get_n_bits(params, 1, 'redundant_pic_cnt_present_flag'));

  if (get_bits_left(params) > 0 && more_rbsp_data_in_pps(sps)) {
    const transform_8x8_mode_flag = get_n_bits(params, 1, 'transform_8x8_mode_flag');
    pic_parameter_set_data.push(transform_8x8_mode_flag);
    const pic_scaling_matrix_present_flag = get_n_bits(params, 1, 'pic_scaling_matrix_present_flag');
    pic_parameter_set_data.push(pic_scaling_matrix_present_flag);

    if (pic_scaling_matrix_present_flag.value) {
      const chroma_format_idc = findNALTreeProperty(sps, 'chroma_format_idc') as Property;
      for (let i = 0; i < 6 + ((chroma_format_idc.value !== 3) ? 2 : 6) * transform_8x8_mode_flag.value; i++) {
        const pic_scaling_list_present_flag = get_n_bits(params, 1, `pic_scaling_list_present_flag[${i}]`);
        pic_parameter_set_data.push(pic_scaling_list_present_flag);
        // todo 这里有一段scaling_list代码以后弄明白一些概念再写
      }
    }

    pic_parameter_set_data.push(get_se_golomb(params, 'second_chroma_qp_index_offset'));
  } else {
    pic_parameter_set_data.push({
      key: generateUUID(),
      bits: 0,
      startBytes: 'N/A',
      title: 'second_chroma_qp_index_offset',
      value: chroma_qp_index_offset.value
    });
  }

  pic_parameter_set_data.push({
    key: generateUUID(),
    title: 'rbsp_trailing_bits',
    startBytes: Math.floor(params.readBitIndex / 8),
    bits: 'N/A',
    children: [],
  });

  return parseResult;
}