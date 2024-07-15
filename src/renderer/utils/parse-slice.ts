/**
 * 对类型为SEI的NAL Unit的数据进行解析，解析出字节所表示的含义
 */
import { Property } from '../types/parse-nalu';
import { findNALTreeProperty, getChromaArrayType, getNaluCommonStruct } from './parse-nalu-common';
import { generateUUID } from './generate-uuid';
import { get_se_golomb, get_ue_golomb, get_ue_golomb_long } from './golomb';
import { SliceTypes, sliceTypesMap } from '../types/slice-types';
import { get_n_bits } from './operate-n-bits';
import { NalUnitTypes, RBSPSyntaxStructureMap } from '../types/nal-unit-types';

function parse_ref_count(params: { nalu: number[]; readBitIndex: number; }, pps: Property[], slice_type_value: number, slice_header: Property[]) {
  const ref_count: number[] = [(findNALTreeProperty(pps, 'num_ref_idx_l0_default_active_minus1') as Property).value as number + 1, ((findNALTreeProperty(pps, 'num_ref_idx_l1_default_active_minus1') as Property).value) as number + 1];
  
  if (slice_type_value === SliceTypes.P || slice_type_value === SliceTypes.SP || slice_type_value === SliceTypes.B) {
    const num_ref_idx_active_override_flag = get_n_bits(params, 1, 'num_ref_idx_active_override_flag');
    slice_header.push(num_ref_idx_active_override_flag);

    if (num_ref_idx_active_override_flag.value) {
      const num_ref_idx_l0_active_minus1 = get_ue_golomb(params, 'num_ref_idx_l0_active_minus1');
      slice_header.push(num_ref_idx_l0_active_minus1);
      ref_count[0] = num_ref_idx_l0_active_minus1.value + 1;
      if (slice_type_value === SliceTypes.B) {
        const num_ref_idx_l1_active_minus1 = get_ue_golomb(params, 'num_ref_idx_l1_active_minus1');
        slice_header.push(num_ref_idx_l1_active_minus1);
        ref_count[1] = num_ref_idx_l1_active_minus1.value + 1;
      } else ref_count[1] = 1;
    }
  } else ref_count[0] = ref_count[1] = 0;

  return ref_count;
}

function parse_ref_pic_list_modification(params: { nalu: number[]; readBitIndex: number; }, slice_type_value: number, ref_count: number[]): Property[] {
  const ref_pic_list_modification: Property[] = [];
  const slice_type_value_remainder = slice_type_value % 5;
  if (slice_type_value_remainder !== SliceTypes.I && slice_type_value_remainder !== SliceTypes.SI) {
    const ref_pic_list_modification_flag_l0 = get_n_bits(params, 1, 'ref_pic_list_modification_flag_l0');
    ref_pic_list_modification.push(ref_pic_list_modification_flag_l0);
    console.log(ref_count, 'ref_count')
    if(ref_pic_list_modification_flag_l0.value) {
      let modification_of_pic_nums_idc;
      let i = 0;
      do {
        modification_of_pic_nums_idc = get_ue_golomb(params, 'modification_of_pic_nums_idc');
        console.log(modification_of_pic_nums_idc.value, 'modification_of_pic_nums_idc')
        ref_pic_list_modification.push(modification_of_pic_nums_idc);
        if (modification_of_pic_nums_idc.value === 0 || modification_of_pic_nums_idc.value === 1) {
          ref_pic_list_modification.push(get_ue_golomb(params, 'abs_diff_pic_num_minus1'));
        }

        if (modification_of_pic_nums_idc.value === 2) {
          ref_pic_list_modification.push(get_ue_golomb(params, 'long_term_pic_num'));
        }
        i++;
      } while(modification_of_pic_nums_idc.value !== 3 && i < ref_count[0])
    }
  }

  if (slice_type_value_remainder === SliceTypes.B) {
    const ref_pic_list_modification_flag_l1 = get_n_bits(params, 1, 'ref_pic_list_modification_flag_l1');
    ref_pic_list_modification.push(ref_pic_list_modification_flag_l1);

    if (ref_pic_list_modification_flag_l1.value) {
      let modification_of_pic_nums_idc;
      let i = 0;
      do {
        modification_of_pic_nums_idc = get_ue_golomb(params, 'modification_of_pic_nums_idc');
        ref_pic_list_modification.push(modification_of_pic_nums_idc);
        if (modification_of_pic_nums_idc.value === 0 || modification_of_pic_nums_idc.value === 1) {
          ref_pic_list_modification.push(get_ue_golomb(params, 'abs_diff_pic_num_minus1'));
        }

        if (modification_of_pic_nums_idc.value === 2) {
          ref_pic_list_modification.push(get_ue_golomb(params, 'long_term_pic_num'));
        }
        i++;
      } while(modification_of_pic_nums_idc.value !== 3 && i < ref_count[0])
    }
  }

  return ref_pic_list_modification;
}

function parse_ref_pic_list_mvc_modification(params: { nalu: number[]; readBitIndex: number; }, slice_type_value: number, ref_count: number[]): Property[] {
  const ref_pic_list_modification: Property[] = [];
  const slice_type_value_remainder = slice_type_value % 5;
  if (slice_type_value_remainder !== SliceTypes.I && slice_type_value_remainder !== SliceTypes.SI) {
    const ref_pic_list_modification_flag_l0 = get_n_bits(params, 1, 'ref_pic_list_modification_flag_l0');
    ref_pic_list_modification.push(ref_pic_list_modification_flag_l0);

    console.log(ref_count, 'ref_count')

    if(ref_pic_list_modification_flag_l0.value) {
      let modification_of_pic_nums_idc;
      let i = 0;
      do {
        modification_of_pic_nums_idc = get_ue_golomb(params, 'modification_of_pic_nums_idc');
        ref_pic_list_modification.push(modification_of_pic_nums_idc);
        if (modification_of_pic_nums_idc.value === 0 || modification_of_pic_nums_idc.value === 1) {
          ref_pic_list_modification.push(get_ue_golomb(params, 'abs_diff_pic_num_minus1'));
        } else if (modification_of_pic_nums_idc.value === 2) {
          ref_pic_list_modification.push(get_ue_golomb(params, 'long_term_pic_num'));
        } else if (modification_of_pic_nums_idc.value === 4 || modification_of_pic_nums_idc.value === 5) {
          ref_pic_list_modification.push(get_ue_golomb(params, 'abs_diff_view_idx_minus1'));
        }
        i++;
      } while(modification_of_pic_nums_idc.value !== 3 && i < ref_count[0])
    }
  }

  if (slice_type_value_remainder === SliceTypes.B) {
    const ref_pic_list_modification_flag_l1 = get_n_bits(params, 1, 'ref_pic_list_modification_flag_l1');
    ref_pic_list_modification.push(ref_pic_list_modification_flag_l1);

    if (ref_pic_list_modification_flag_l1.value) {
      let modification_of_pic_nums_idc;
      let i = 0;
      do {
        modification_of_pic_nums_idc = get_ue_golomb(params, 'modification_of_pic_nums_idc');
        ref_pic_list_modification.push(modification_of_pic_nums_idc);
        if (modification_of_pic_nums_idc.value === 0 || modification_of_pic_nums_idc.value === 1) {
          ref_pic_list_modification.push(get_ue_golomb(params, 'abs_diff_pic_num_minus1'));
        } else if (modification_of_pic_nums_idc.value === 2) {
          ref_pic_list_modification.push(get_ue_golomb(params, 'long_term_pic_num'));
        } else if (modification_of_pic_nums_idc.value === 4 || modification_of_pic_nums_idc.value === 5) {
          ref_pic_list_modification.push(get_ue_golomb(params, 'abs_diff_view_idx_minus1'));
        }
        i++;
      } while(modification_of_pic_nums_idc.value !== 3 && i < ref_count[1])
    }
  }

  return ref_pic_list_modification;
}


function parse_pred_weight_table(params: { nalu: number[]; readBitIndex: number; }, sps: Property[], ref_count: number[], slice_type_value: number): Property[] {
  const pred_weight_table: Property[] = [];

  const luma_log2_weight_denom = get_ue_golomb(params, 'luma_log2_weight_denom');
  pred_weight_table.push(luma_log2_weight_denom);

  const slice_type_value_remainder = slice_type_value % 5;

  const chromaArrayType = getChromaArrayType(sps);
  console.log(chromaArrayType, 'chromaArrayType')

  if (chromaArrayType !== 0) {
    const chroma_log2_weight_denom = get_ue_golomb(params, 'chroma_log2_weight_denom');
    pred_weight_table.push(chroma_log2_weight_denom);
  }

  for (let i = 0; i < ref_count[0]; i++) {
    const luma_weight_l0_flag = get_n_bits(params, 1, `luma_weight_l0_flag`);
    const luma_weight_l0: Property[] = [];
    pred_weight_table.push({
      key: generateUUID(),
      title: 'luma_weight_l0',
      startBytes: 'N/A',
      bits: 'N/A',
      children: luma_weight_l0
    });
    luma_weight_l0.push(luma_weight_l0_flag);
    if (luma_weight_l0_flag.value) {
      luma_weight_l0.push(get_se_golomb(params, `luma_weight_l0[${i}]`));
      luma_weight_l0.push(get_se_golomb(params, `luma_offset_l0[${i}]`));
    }

    if (chromaArrayType !== 0) {
      const chroma_weight_l0: Property[] = [];
      pred_weight_table.push({
        key: generateUUID(),
        title: 'chroma_weight_l0',
        startBytes: 'N/A',
        bits: 'N/A',
        children: chroma_weight_l0
      });
      const chroma_weight_l0_flag = get_n_bits(params, 1, `chroma_weight_l0_flag`);
      chroma_weight_l0.push(chroma_weight_l0_flag);
      if (chroma_weight_l0_flag.value) {
        for(let j = 0; j < 2; j++) {
          chroma_weight_l0.push(get_se_golomb(params, `chroma_weight_l0[${i}][${j}]`));
          chroma_weight_l0.push(get_se_golomb(params, `chroma_offset_l0[${i}][${j}]`));
        }
      }
    }
  }

  if (slice_type_value_remainder === SliceTypes.B) {
    for (let i = 0; i <= ref_count[1]; i++) {
      const luma_weight_l1_flag = get_n_bits(params, 1, `luma_weight_l1_flag`);
      const luma_weight_l1: Property[] = [];
      luma_weight_l1.push(luma_weight_l1_flag);
      
      pred_weight_table.push({
        key: generateUUID(),
        title: 'luma_weight_l1',
        startBytes: 'N/A',
        bits: 'N/A',
        children: luma_weight_l1
      });

      if (luma_weight_l1_flag.value) {
        luma_weight_l1.push(get_se_golomb(params, `luma_weight_l1[${i}]`));
        luma_weight_l1.push(get_se_golomb(params, `luma_offset_l1[${i}]`));
      }

      if (chromaArrayType !== 0) {
        const chroma_weight_l1_flag = get_n_bits(params, 1, `chroma_weight_l1_flag_${i}`);
        const chroma_weight_l1: Property[] = [];
        chroma_weight_l1.push(chroma_weight_l1_flag);

        pred_weight_table.push({
          key: generateUUID(),
          title: 'chroma_weight_l1',
          startBytes: 'N/A',
          bits: 'N/A',
          children: chroma_weight_l1
        });
        
        
        if (chroma_weight_l1_flag.value) {
          for(let j = 0; j < 2; j++) {
            chroma_weight_l1.push(get_se_golomb(params, `chroma_weight_l1[${i}][${j}]`));
            chroma_weight_l1.push(get_se_golomb(params, `chroma_offset_l1[${i}][${j}]`));
          }
        }
      }
    }
  }
  return pred_weight_table;
}

function parse_dec_ref_pic_marking(params: { nalu: number[]; readBitIndex: number; }, nal_unit_type: number): Property[] {
  const dec_ref_pic_marking: Property[] = [];
  if (nal_unit_type === NalUnitTypes.H264_NAL_IDR_SLICE) {
    dec_ref_pic_marking.push(get_n_bits(params, 1, 'no_output_of_prior_pics_flag'));
    dec_ref_pic_marking.push(get_n_bits(params, 1, 'long_term_reference_flag'));
  } else {
    const adaptive_ref_pic_marking_mode_flag = get_n_bits(params, 1, 'adaptive_ref_pic_marking_mode_flag');
    dec_ref_pic_marking.push(adaptive_ref_pic_marking_mode_flag);
    if (adaptive_ref_pic_marking_mode_flag.value) {
      let memory_management_control_operation: Property;
      do {
        memory_management_control_operation = get_ue_golomb(params, 'memory_management_control_operation');

        if (memory_management_control_operation.value === 1 || memory_management_control_operation.value === 3)
          dec_ref_pic_marking.push(get_ue_golomb(params, 'difference_of_pic_nums_minus1'));

        if (memory_management_control_operation.value === 2)
          dec_ref_pic_marking.push(get_ue_golomb(params, 'long_term_pic_num'));

        if (memory_management_control_operation.value === 3 || memory_management_control_operation.value === 6)
          dec_ref_pic_marking.push(get_ue_golomb(params, 'long_term_frame_idx'))

        if (memory_management_control_operation.value === 4)
          dec_ref_pic_marking.push(get_ue_golomb(params, 'max_long_term_frame_idx_plus1'))

      } while (memory_management_control_operation.value !== 0);
    }
  }
  return dec_ref_pic_marking;
}

function parse_slice_header(params: { nalu: number[]; readBitIndex: number; }, sps: Property[], pps: Property[], nal_unit_type: number, nal_ref_idc: number): Property[] {
  const slice_header: Property[] = [];
  slice_header.push(get_ue_golomb_long(params, 'first_mb_in_slice'))

  const slice_type = get_ue_golomb(params, 'slice_type');

  const slice_type_value = slice_type.value % 5;

  slice_header.push(slice_type);

  
  const pic_parameter_sequence_id = get_ue_golomb(params, 'pic_parameter_sequence_id');
  slice_header.push(pic_parameter_sequence_id);
  
  const separate_colour_plane_flag = findNALTreeProperty(sps, 'separate_colour_plane_flag');

  if (separate_colour_plane_flag !== -1 && separate_colour_plane_flag.value === 1) 
    slice_header.push(get_n_bits(params, 2, 'colour_plane_id'));
  
  const log2_max_frame_num_minus4 = findNALTreeProperty(sps, 'log2_max_frame_num_minus4') as Property;

  const frame_num = get_n_bits(params, (log2_max_frame_num_minus4.value) as number + 4, 'frame_num');

  slice_header.push(frame_num);

  const frame_mbs_only_flag = findNALTreeProperty(sps, 'frame_mbs_only_flag');

  let field_pic_flag;
  if (frame_mbs_only_flag === -1 || !frame_mbs_only_flag.value) {
    field_pic_flag = get_n_bits(params, 1, 'field_pic_flag');
    slice_header.push(field_pic_flag);
    if (field_pic_flag.value) {
      const bottom_field_flag = get_n_bits(params, 1, 'bottom_field_flag');
      slice_header.push(bottom_field_flag);
    }
  }

  if (nal_unit_type === NalUnitTypes.H264_NAL_IDR_SLICE) {
    slice_header.push(get_ue_golomb_long(params, 'idr_pic_id'));
  }

  const pic_order_cnt_type = findNALTreeProperty(sps, 'pic_order_cnt_type') as Property;
  if (pic_order_cnt_type.value === 0) {
    const log2_max_pic_order_cnt_lsb_minus4 = findNALTreeProperty(sps, 'log2_max_pic_order_cnt_lsb_minus4') as Property;
    slice_header.push(get_n_bits(params, log2_max_pic_order_cnt_lsb_minus4.value as number + 4, 'pic_order_cnt_lsb'));

    const bottom_field_pic_order_in_frame_present_flag = findNALTreeProperty(pps, 'bottom_field_pic_order_in_frame_present_flag') as Property;
    if (bottom_field_pic_order_in_frame_present_flag.value === 1 && (!field_pic_flag || !field_pic_flag.value)) {
      slice_header.push(get_se_golomb(params, 'delta_pic_order_cnt_bottom'));
    }
  }

  const delta_pic_order_always_zero_flag = findNALTreeProperty(sps, 'delta_pic_order_always_zero_flag');
  if (pic_order_cnt_type.value === 1 && (delta_pic_order_always_zero_flag === -1 || !delta_pic_order_always_zero_flag.value)) {
    slice_header.push(get_se_golomb(params, 'delta_pic_order_cnt[0]'));
    const bottom_field_pic_order_in_frame_present_flag = findNALTreeProperty(pps, 'bottom_field_pic_order_in_frame_present_flag') as Property;
    if (bottom_field_pic_order_in_frame_present_flag.value === 1 && (!field_pic_flag || !field_pic_flag.value)) {
      slice_header.push(get_se_golomb(params, 'delta_pic_order_cnt[1]'));
    }
  }

  const redundant_pic_cnt_present_flag = findNALTreeProperty(pps, 'redundant_pic_cnt_present_flag');
  if (redundant_pic_cnt_present_flag !== -1 && redundant_pic_cnt_present_flag.value)
    slice_header.push(get_ue_golomb(params, 'redundant_pic_cnt'));


  if (slice_type_value === SliceTypes.B) slice_header.push(get_n_bits(params, 1, 'direct_spatial_mv_pred_flag'));

  
  const ref_count = parse_ref_count(params, pps, slice_type_value, slice_header);
  
  let ref_pic_list_modification: Property[] = [];

  if (nal_unit_type === 20 || nal_unit_type === 21) {
    ref_pic_list_modification = parse_ref_pic_list_mvc_modification(params, slice_type_value, ref_count);
  } else {
    ref_pic_list_modification = parse_ref_pic_list_modification(params, slice_type_value, ref_count);
  }
  
  slice_header.push({
    key: generateUUID(),
    title: 'ref_pic_list_modification',
    startBytes: Math.ceil(params.readBitIndex / 8),
    bits: 'N/A',
    children: ref_pic_list_modification
  })

  const weighted_pred_flag = findNALTreeProperty(pps, 'weighted_pred_flag') as Property;
  const weighted_bipred_idc = findNALTreeProperty(pps, 'weighted_bipred_idc') as Property;
  if ((weighted_pred_flag.value && (slice_type_value === SliceTypes.P || slice_type_value === SliceTypes.SP)) ||
    (weighted_bipred_idc.value === 1 && slice_type_value === SliceTypes.B)) {
    const pred_weight_table: Property[] = parse_pred_weight_table(params, sps, ref_count, slice_type_value);

    slice_header.push({
      key: generateUUID(),
      title: 'pred_weight_table',
      startBytes: Math.ceil(params.readBitIndex / 8),
      bits: 'N/A',
      children: pred_weight_table
    });
  }

  if (nal_ref_idc !== 0) {
    const dec_ref_pic_marking: Property[] = parse_dec_ref_pic_marking(params, nal_unit_type)
    slice_header.push({
      key: generateUUID(),
      title: 'dec_ref_pic_marking',
      startBytes: Math.ceil(params.readBitIndex / 8),
      bits: 'N/A',
      children: dec_ref_pic_marking
    });
  }


  const entropy_coding_mode_flag = findNALTreeProperty(pps, 'entropy_coding_mode_flag');
  if ((entropy_coding_mode_flag !== -1 && entropy_coding_mode_flag.value) && slice_type_value !== SliceTypes.I && slice_type_value !== SliceTypes.SI)
    slice_header.push(get_ue_golomb(params, 'cabac_init_idc'));

  slice_header.push(get_se_golomb(params, 'slice_qp_delta'));

  if (slice_type_value === SliceTypes.SP || slice_type_value === SliceTypes.SI) {
    if (slice_type_value === SliceTypes.SP)
      slice_header.push(get_n_bits(params, 1, 'sp_for_switch_flag'));
    slice_header.push(get_se_golomb(params, 'slice_qs_delta'));
  }

  const deblocking_filter_control_present_flag = findNALTreeProperty(pps, 'deblocking_filter_control_present_flag');
  if (deblocking_filter_control_present_flag !== -1 && deblocking_filter_control_present_flag.value) {
    const disable_deblocking_filter_idc = get_ue_golomb(params, 'disable_deblocking_filter_idc');
    slice_header.push(disable_deblocking_filter_idc);

    if (disable_deblocking_filter_idc.value !== 1) {
      slice_header.push(get_se_golomb(params, 'slice_alpha_c0_offset_div2'));
      slice_header.push(get_se_golomb(params, 'slice_beta_offset_div2'));
    }
  }

  const num_slice_groups_minus1 = findNALTreeProperty(pps, 'num_slice_groups_minus1');
  const slice_group_map_type = findNALTreeProperty(pps, 'slice_group_map_type');
  
  if (num_slice_groups_minus1 !== -1 && slice_group_map_type !== -1 && (num_slice_groups_minus1.value as number) > 0 && (slice_group_map_type.value as number) >= 3 && (slice_group_map_type.value as number) <=5) {
    const pic_height_in_map_units_minus1 = findNALTreeProperty(sps, 'pic_height_in_map_units_minus1') as Property;
    const PicHeightInMapUnits = (pic_height_in_map_units_minus1.value as number) + 1;
    const pic_width_in_mbs_minus1 = findNALTreeProperty(sps, 'pic_width_in_mbs_minus1') as Property;
    const PicWidthInMbs = (pic_width_in_mbs_minus1.value as number) + 1;
    const PicSizeInMapUnits = PicWidthInMbs * PicHeightInMapUnits;
    const slice_group_change_rate_minus1 = findNALTreeProperty(pps, 'slice_group_change_rate_minus1') as Property;
    const SliceGroupChangeRate = (slice_group_change_rate_minus1.value as number) + 1;
    slice_header.push(get_n_bits(params, Math.ceil(Math.log2( PicSizeInMapUnits / SliceGroupChangeRate + 1 ) ), 'slice_group_change_cycle'));
  }
  return slice_header;
}

export function handleSlice(nalu: number[], sps: Property[], pps: Property[]): Property[] {
  // 从5字节的位置开始读其他的信息，换算成bit位置的话是40
  const params = {
    nalu,
    readBitIndex: 40
  }

  const nal_unit_type = nalu[4] & 0x1f;
  const nal_ref_idc = (nalu[4] & 0x60) >> 5;

  const parseResult: Property[] = [
    ...getNaluCommonStruct(nalu),
  ];

  const rbsp: Property[] = [];

  parseResult.push({
    key: generateUUID(),
    title: RBSPSyntaxStructureMap[nal_unit_type],
    startBytes: 5,
    bits: 'N/A',
    children: rbsp,
  });

  if (nal_unit_type === NalUnitTypes.H264_NAL_DPA || NalUnitTypes.H264_NAL_SLICE) {
    const slice_header: Property[] = parse_slice_header(params, sps, pps, nal_unit_type, nal_ref_idc);
  
    rbsp.push({
      key: generateUUID(),
      title: 'slice_header',
      startBytes: 5,
      bits: 'N/A',
      children: slice_header,
    });
  }

  if (nal_unit_type === NalUnitTypes.H264_NAL_DPA || nal_unit_type === NalUnitTypes.H264_NAL_DPB || nal_unit_type === NalUnitTypes.H264_NAL_DPC)
    rbsp.push(get_ue_golomb(params, 'slice_id'));

  if (nal_unit_type === NalUnitTypes.H264_NAL_DPB || nal_unit_type === NalUnitTypes.H264_NAL_DPC) {
    const separate_colour_plane_flag = findNALTreeProperty(sps, 'separate_colour_plane_flag');
  
    if (separate_colour_plane_flag !== -1 && separate_colour_plane_flag.value === 1) 
      rbsp.push(get_n_bits(params, 2, 'colour_plane_id'));

    const redundant_pic_cnt_present_flag = findNALTreeProperty(pps, 'redundant_pic_cnt_present_flag');
    if (redundant_pic_cnt_present_flag !== -1 && redundant_pic_cnt_present_flag.value)
      rbsp.push(get_ue_golomb(params, 'redundant_pic_cnt'));

  }



  rbsp.push({
    key: generateUUID(),
    title: 'slice_data',
    startBytes: 'N/A',
    bits: 'N/A',
    children: [],
  });

  rbsp.push({
    key: generateUUID(),
    title: 'rbsp_slice_trailing_bits',
    startBytes: 'N/A',
    bits: 'N/A',
    children: [],
  });
  

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

  const slice_type = get_ue_golomb(params, 'slice_type');
  return sliceTypesMap[slice_type.value];
}