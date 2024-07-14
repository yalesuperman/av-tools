/**
 * 对类型为SPS的NAL Unit的数据进行解析，解析出字节所表示的含义
 */
import { generateUUID } from './generate-uuid';
import { Property } from '../types/parse-nalu';
import { get_ue_golomb, get_se_golomb, get_ue_golomb_long } from './golomb';
import { get_n_bits } from './operate-n-bits';
import { parse_h2645_common_vui_params } from './parse-h2645-common-vui-params';
import { getNaluCommonStruct } from './parse-nalu-common';
import { RBSPSyntaxStructureMap } from '../types/nal-unit-types';

function decode_hrd_parameters(param: { nalu: number[]; readBitIndex: number; }): Property[] {
  const hrd_parameters: Property[] = [];
  const cpb_cnt = get_ue_golomb(param, 'cpb_cnt_minus1')

  hrd_parameters.push(cpb_cnt);

  hrd_parameters.push(get_n_bits(param, 4, 'bit_rate_scale'));
  hrd_parameters.push(get_n_bits(param, 4, 'cpb_size_scale'));

  cpb_cnt.children = [];

  for (let i = 0; i < cpb_cnt.value; i++) {
    cpb_cnt.children.push(get_ue_golomb_long(param, `bit_rate_value_minus1[${i}]`));
    cpb_cnt.children.push(get_ue_golomb_long(param, `cpb_size_value_minus1[${i}]`));
    cpb_cnt.children.push(get_n_bits(param, 1, `cbr_flag[${i}]`));
  }

  hrd_parameters.push(get_n_bits(param, 5, 'initial_cpb_removal_delay_length_minus1'));
  hrd_parameters.push(get_n_bits(param, 5, 'cpb_removal_delay_length_minus1'));
  hrd_parameters.push(get_n_bits(param, 5, 'dpb_output_delay_length_minus1'));
  hrd_parameters.push(get_n_bits(param, 5, 'time_offset_length'));

  return hrd_parameters;
}

/**
 * 解析vui_parameters
 * @param param nalu: number[]; readBitIndex: number; 注：readBitIndex 开始读取nalu的下标
 * @returns
 */
function decode_vui_parameters(param: { nalu: number[]; readBitIndex: number; }): Property[] {
  let vui_parameters: Property[] = [];

  const common_vui_parameters = parse_h2645_common_vui_params(param);
  vui_parameters = common_vui_parameters;

  const timing_info_present_flag = get_n_bits(param, 1, 'timing_info_present_flag');
  vui_parameters.push(timing_info_present_flag);
  timing_info_present_flag.children = [];

  if (timing_info_present_flag.value) {
    timing_info_present_flag.children.push(get_n_bits(param, 32, 'num_units_in_tick'));
    timing_info_present_flag.children.push(get_n_bits(param, 32, 'time_scale'));
    timing_info_present_flag.children.push(get_n_bits(param, 1, 'fixed_frame_rate_flag'));
  }

  const nal_hrd_parameters_present_flag = get_n_bits(param, 1, 'nal_hrd_parameters_present_flag');
  vui_parameters.push(nal_hrd_parameters_present_flag);
  if (nal_hrd_parameters_present_flag.value) 
    nal_hrd_parameters_present_flag.children = decode_hrd_parameters(param);

  const vcl_hrd_parameters_present_flag = get_n_bits(param, 1, 'vcl_hrd_parameters_present_flag');
  vui_parameters.push(vcl_hrd_parameters_present_flag);
  if (vcl_hrd_parameters_present_flag.value)
    vcl_hrd_parameters_present_flag.children = decode_hrd_parameters(param);

  if (nal_hrd_parameters_present_flag.value || vcl_hrd_parameters_present_flag.value)
    vui_parameters.push(get_n_bits(param, 1, 'low_delay_hrd_flag'));

  vui_parameters.push(get_n_bits(param, 1, 'pic_struct_present_flag'));

  const bitstream_restriction_flag = get_n_bits(param, 1, 'bitstream_restriction_flag');
  vui_parameters.push(bitstream_restriction_flag);

  if (bitstream_restriction_flag.value) {
    bitstream_restriction_flag.children = [];
    bitstream_restriction_flag.children.push(get_n_bits(param, 1, 'motion_vectors_over_pic_boundaries_flag'));
    bitstream_restriction_flag.children.push(get_ue_golomb(param, 'max_bytes_per_pic_denom'));
    bitstream_restriction_flag.children.push(get_ue_golomb(param, 'max_bits_per_mb_denom'));
    bitstream_restriction_flag.children.push(get_ue_golomb(param, 'log2_max_mv_length_horizontal'));
    bitstream_restriction_flag.children.push(get_ue_golomb(param, 'log2_max_mv_length_vertical'));
    bitstream_restriction_flag.children.push(get_ue_golomb(param, 'max_num_reorder_frames'));
    bitstream_restriction_flag.children.push(get_ue_golomb(param, 'max_dec_frame_buffering'));
  }

  return vui_parameters;
}

export function handleSPS(nalu: number[]): Property[] {
  // 从8字节的位置开始读其他的信息，换算成bit位置的话是64
  const params = {
    nalu,
    readBitIndex: 40
  }
  const nal_unit_type = nalu[4] & 0x1f;
  const seq_parameter_set_data: Property[] = [
    get_n_bits(params, 8, 'profile_idc'),
    get_n_bits(params, 1, 'constraint_set0_flag'),
    get_n_bits(params, 1, 'constraint_set1_flag'),
    get_n_bits(params, 1, 'constraint_set2_flag'),
    get_n_bits(params, 1, 'constraint_set3_flag'),
    get_n_bits(params, 1, 'constraint_set4_flag'),
    get_n_bits(params, 1, 'constraint_set5_flag'),
    get_n_bits(params, 2, 'reserved_zero_2bits'),
    get_n_bits(params, 8, 'level_idc')
  ];
  let tempData: Omit<Property, 'value'> & { value: number };

  seq_parameter_set_data.push(get_ue_golomb(params, 'seq_parameter_set_id'));

  const profile_idc = seq_parameter_set_data[0].value;

  if(profile_idc === 100 || profile_idc === 110 ||
    profile_idc === 122 || profile_idc === 244 || profile_idc ===  44 ||
    profile_idc ===  83 || profile_idc ===  86 || profile_idc === 118 ||
    profile_idc === 128 || profile_idc === 138 || profile_idc === 139 ||
    profile_idc === 134 || profile_idc === 135) {
      tempData = get_ue_golomb(params, 'chroma_format_idc');
      seq_parameter_set_data.push(tempData);

      if (tempData.value === 3) {
        seq_parameter_set_data.push(get_n_bits(params, 1, 'separate_colour_plane_flag'));
      }

      seq_parameter_set_data.push(get_ue_golomb(params, 'bit_depth_luma_minus8'));

      seq_parameter_set_data.push(get_ue_golomb(params, 'bit_depth_chroma_minus8'));

      seq_parameter_set_data.push(get_n_bits(params, 1, 'qpprime_y_zero_transform_bypass_flag'));

      tempData = get_n_bits(params, 1, 'seq_scaling_matrix_present_flag');
      seq_parameter_set_data.push(tempData);

      if (tempData.value) {
        let delta_scale, lastScale = 8, nextScale = 8;
        let sizeOfScalingList;
        for (let i = 0; i < ((seq_parameter_set_data[11].value !== 3) ? 8 : 12); i++) {
          if (!get_n_bits(params, 1, '').value) // seq_scaling_list_present_flag
              continue;
          lastScale = 8;
          nextScale = 8;
          sizeOfScalingList = i < 6 ? 16 : 64;
          for (let j = 0; j < sizeOfScalingList; j++) {
              if (nextScale !== 0) {
                  delta_scale = get_se_golomb(params, '').value as number;
                  nextScale = (lastScale + delta_scale) & 0xff;
              }
              lastScale = nextScale === 0 ? lastScale : nextScale;
          }
        }
      }
  } else {
    seq_parameter_set_data.push({
      title: 'chroma_format_idc',
      key: generateUUID(),
      value: 1,
      bits: 0,
      startBytes: 'N/A'
    });
    seq_parameter_set_data.push({
      title: 'bit_depth_luma_minus8',
      key: generateUUID(),
      value: 0,
      bits: 0,
      startBytes: 'N/A'
    });
    seq_parameter_set_data.push({
      title: 'bit_depth_chroma_minus8',
      key: generateUUID(),
      value: 8,
      bits: 0,
      startBytes: 'N/A'
    });
  }

  seq_parameter_set_data.push(get_ue_golomb(params, 'log2_max_frame_num_minus4'));

  tempData = get_ue_golomb(params, 'pic_order_cnt_type');
  seq_parameter_set_data.push(tempData);
  if (tempData.value === 0) {
    seq_parameter_set_data.push(get_ue_golomb(params, 'log2_max_pic_order_cnt_lsb_minus4'));
  } else if (tempData.value === 1) {
      seq_parameter_set_data.push(get_n_bits(params, 1, 'delta_pic_order_always_zero_flag'));
      seq_parameter_set_data.push(get_se_golomb(params, 'offset_for_non_ref_pic'));
      seq_parameter_set_data.push(get_se_golomb(params, 'offset_for_top_to_bottom_field'));

      tempData = get_ue_golomb(params, 'num_ref_frames_in_pic_order_cnt_cycle');
      seq_parameter_set_data.push(tempData);
      for (let i = 0; i < tempData.value; i++)
          get_se_golomb(params, `offset_for_ref_frame_${i}`); // offset_for_ref_frame
  }

  seq_parameter_set_data.push(get_ue_golomb(params, 'max_num_ref_frames')); // max_num_ref_frames
  seq_parameter_set_data.push(get_n_bits(params, 1, 'gaps_in_frame_num_value_allowed_flag'));
  seq_parameter_set_data.push(get_ue_golomb(params, 'pic_width_in_mbs_minus1'));
  seq_parameter_set_data.push(get_ue_golomb(params, 'pic_height_in_map_units_minus1'));

  tempData = get_n_bits(params, 1, 'frame_mbs_only_flag');
  seq_parameter_set_data.push(tempData)
  if (!tempData.value)
    seq_parameter_set_data.push(get_n_bits(params, 1, 'mb_adaptive_frame_field_flag'));

  seq_parameter_set_data.push(get_n_bits(params, 1, 'direct_8x8_inference_flag'));

  tempData = get_n_bits(params, 1, 'frame_cropping_flag');
  seq_parameter_set_data.push(tempData);
  if (tempData.value) {
    seq_parameter_set_data.push(get_ue_golomb(params, 'frame_crop_left_offset')); 
    seq_parameter_set_data.push(get_ue_golomb(params, 'frame_crop_right_offset')); 
    seq_parameter_set_data.push(get_ue_golomb(params, 'frame_crop_top_offset')); 
    seq_parameter_set_data.push(get_ue_golomb(params, 'frame_crop_bottom_offset')); 
  }

  let vui_parameters: Property[] = [];

  tempData = get_n_bits(params, 1, 'vui_parameters_present_flag');
  seq_parameter_set_data.push(tempData);

  if (tempData.value) {
    vui_parameters = decode_vui_parameters(params);
  }

  seq_parameter_set_data.push({
    key: generateUUID(),
    title: 'vui_parameters',
    children: vui_parameters,
    bits: 'N/A',
    startBytes: 'N/A'
  });

  return [
    ...getNaluCommonStruct(nalu),
    {
      key: generateUUID(),
      title: RBSPSyntaxStructureMap[nal_unit_type],
      startBytes: 5,
      bits: 'N/A',
      children: [
        {
          key: generateUUID(),
          title: 'seq_parameter_set_data',
          startBytes: 5,
          bits: 'N/A',
          children: seq_parameter_set_data,
        },
        {
          key: generateUUID(),
          title: 'rbsp_trailing_bits',
          startBytes: Math.floor(params.readBitIndex / 8),
          bits: 'N/A',
          children: [],
        }
      ],
    },
  ];
}