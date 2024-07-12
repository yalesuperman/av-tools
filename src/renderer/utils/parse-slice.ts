/**
 * 对类型为SEI的NAL Unit的数据进行解析，解析出字节所表示的含义
 */
import { Property } from '../types/parse-nalu';
import { findNALTreeProperty, getNaluCommonStruct } from './parse-nalu-common';
import { generateUUID } from './generate-uuid';
import { get_se_golomb, get_ue_golomb, get_ue_golomb_long } from './golomb';
import { PictureTypes, ff_h264_golomb_to_pict_type, pictureTypesMap } from '../types/pict-types';
import { get_n_bits } from './operate-n-bits';
import { NalUnitTypes } from '../types/nal-unit-types';
import { PictureStructTypes } from '../types/picture-structure-types';

function parse_ref_count(params: { nalu: number[]; readBitIndex: number; }, pps: Property[], slice_type_nos: number, picture_structure: number, slice_header: Property[]): {
  slice_header: Property[],
  ref_count: number[],
  list_count: number;
} {
  const ref_count: number[] = [((findNALTreeProperty(pps, 'num_ref_idx_l0_active_minus1') as Property).value as number), ((findNALTreeProperty(pps, 'num_ref_idx_l1_active_minus1') as Property).value) as number];
  let list_count;
  if (slice_type_nos !== PictureTypes.AV_PICTURE_TYPE_I) {
    const max = [];
    max[0] = max[1] = picture_structure === PictureStructTypes.PICT_FRAME ? 15 : 31;

    const num_ref_idx_active_override_flag = get_n_bits(params, 1, 'num_ref_idx_active_override_flag');
    slice_header.push(num_ref_idx_active_override_flag);

    if (num_ref_idx_active_override_flag.value) {
      const num_ref_idx_l0_active_minus1 = get_ue_golomb(params, 'num_ref_idx_l0_active_minus1');
      slice_header.push(num_ref_idx_l0_active_minus1);
      ref_count[0] = num_ref_idx_l0_active_minus1.value + 1;
      if (slice_type_nos === PictureTypes.AV_PICTURE_TYPE_B) {
        const num_ref_idx_l1_active_minus1 = get_ue_golomb(params, 'num_ref_idx_l1_active_minus1');
        slice_header.push(num_ref_idx_l1_active_minus1);
        ref_count[1] = num_ref_idx_l1_active_minus1.value + 1;
      } else ref_count[1] = 1;
    }

    if (slice_type_nos === PictureTypes.AV_PICTURE_TYPE_B) list_count = 2;
    else list_count = 1;

    if (ref_count[0] - 1 > max[0] || (list_count === 2 && (ref_count[1] - 1 > max[1]))) {
      console.error(`reference overflow ${ref_count[0] - 1} > ${max[0]} or ${ref_count[1] - 1} > ${max[1]}`)
    } else if (ref_count[1] - 1 > max[1]) {
      console.log(`reference overflow ${ref_count[1] - 1} > ${max[1]}`);
      ref_count[1] = 0;
    }
  } else {
    list_count = 0;
    ref_count[0] = ref_count[1] = 0
  }

  return {
    slice_header,
    ref_count,
    list_count
  }
}


function parse_pred_weight_table(params: { nalu: number[]; readBitIndex: number; }, sps: Property[], pps: Property[], ref_count: number[], slice_type_nos: number): Property[] {
  const pred_weight_table: Property[] = [];
  let luma_def, chroma_def;
  const luma_log2_weight_denom = get_ue_golomb(params, 'luma_log2_weight_denom');
  pred_weight_table.push(luma_log2_weight_denom);
  luma_def = 1 << luma_log2_weight_denom.value;

  const chroma_format_idc = findNALTreeProperty(sps, 'chroma_format_idc') as Property;
  if (chroma_format_idc.value) {
    const chroma_log2_weight_denom = get_ue_golomb(params, 'chroma_log2_weight_denom');
    pred_weight_table.push(chroma_log2_weight_denom);
    chroma_def = 1 << chroma_log2_weight_denom.value;
  }

  for (let list = 0; list < 2; list++) {
    for (let i = 0; i < ref_count[list]; i++) {
      const luma_weight_l0_flag = get_n_bits(params, 1, `luma_weight_l0_flag[${i}]`);
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
  
      if (chroma_format_idc.value) {
        const chroma_weight_l0: Property[] = [];
        pred_weight_table.push({
          key: generateUUID(),
          title: 'chroma_weight_l0',
          startBytes: 'N/A',
          bits: 'N/A',
          children: chroma_weight_l0
        });
        const chroma_weight_l0_flag = get_n_bits(params, 1, `chroma_weight_l0_flag[${i}]`);
        chroma_weight_l0.push(chroma_weight_l0_flag);
        if (chroma_weight_l0_flag.value) {
          for(let j = 0; j < 2; j++) {
            chroma_weight_l0.push(get_se_golomb(params, `chroma_weight_l0[${i}][${j}]`));
            chroma_weight_l0.push(get_se_golomb(params, `chroma_offset_l0[${i}][${j}]`));
          }
        }
      }
    }

    if (slice_type_nos !== PictureTypes.AV_PICTURE_TYPE_B)
      break;
  }

  // if (slice_type_nos === PictureTypes.AV_PICTURE_TYPE_B) {
  //   const num_ref_idx_l1_active_minus1 = findNALTreeProperty(pps, 'num_ref_idx_l1_active_minus1') as Property;
  //   for (let i = 0; i <= (num_ref_idx_l1_active_minus1.value as number); i++) {
  //     const luma_weight_l1_flag = get_n_bits(params, 1, `luma_weight_l1_flag_${i}`);
      
  //     if (luma_weight_l1_flag.value) {
  //       // pred_weight_table.push(luma_weight_l1_flag);
  //       const luma_weight_l1: Property[] = [];
  //       pred_weight_table.push({
  //         key: generateUUID(),
  //         title: 'luma_weight_l1',
  //         startBytes: 'N/A',
  //         bits: 'N/A',
  //         children: luma_weight_l1
  //       });
  //       luma_weight_l1.push(get_se_golomb(params, `luma_weight_l1[${i}]`));
  //       luma_weight_l1.push(get_se_golomb(params, `luma_offset_l1[${i}]`));
  //     }

  //     if (chroma_format_idc.value) {
  //       const chroma_weight_l1_flag = get_n_bits(params, 1, `chroma_weight_l1_flag_${i}`);
        
        
  //       if (chroma_weight_l1_flag.value) {
  //         // pred_weight_table.push(chroma_weight_l1_flag);
  //         const chroma_weight_l1: Property[] = [];
  //         pred_weight_table.push({
  //           key: generateUUID(),
  //           title: 'chroma_weight_l1',
  //           startBytes: 'N/A',
  //           bits: 'N/A',
  //           children: chroma_weight_l1
  //         });
  //         for(let j = 0; j < 2; j++) {
  //           chroma_weight_l1.push(get_se_golomb(params, `chroma_weight_l1[${i}][${j}]`));
  //           chroma_weight_l1.push(get_se_golomb(params, `chroma_offset_l1[${i}][${j}]`));
  //         }
  //       }
  //     }
  //   }
  // }
  return pred_weight_table;
}

function parse_dec_ref_pic_marking(params: { nalu: number[]; readBitIndex: number; }): Property[] {
  const dec_ref_pic_marking: Property[] = [];
  const adaptive_ref_pic_marking_mode_flag = get_n_bits(params, 1, 'adaptive_ref_pic_marking_mode_flag');
  dec_ref_pic_marking.push(adaptive_ref_pic_marking_mode_flag);
  if (adaptive_ref_pic_marking_mode_flag.value) {
    for (let i = 0; i < 67; i++) {
        const opcode = get_ue_golomb(params, '').value;

         if(opcode > 6) {
          console.log(`illegal memory management control operation ${opcode}`);
          return dec_ref_pic_marking;
         }

         if (opcode === 0) return dec_ref_pic_marking;
         if (opcode === 5) return dec_ref_pic_marking;

        if (opcode === 1 || opcode === 3)
            get_ue_golomb_long(params, ''); // difference_of_pic_nums_minus1
        if (opcode === 3 || opcode === 2 ||
            opcode === 6 || opcode === 4)
            get_ue_golomb(params, '');
    }
  }
  return dec_ref_pic_marking;
}


export function handleSlice(nalu: number[], sps: Property[], pps: Property[]): Property[] {
  // 从5字节的位置开始读其他的信息，换算成bit位置的话是40
  const params = {
    nalu,
    readBitIndex: 40
  }

  const nal_unit_type = nalu[4] & 0x1f;

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

  const frame_num = get_n_bits(params, (log2_max_frame_num_minus4.value) as number + 4, 'frame_num');

  slice_header.push(frame_num);

  let picture_structure = PictureStructTypes.PICT_FRAME;

  const frame_mbs_only_flag = findNALTreeProperty(sps, 'frame_mbs_only_flag') as Property;

  if (!frame_mbs_only_flag) {
    const field_pic_flag = get_n_bits(params, 1, 'field_pic_flag');
    slice_header.push(field_pic_flag);
    if (field_pic_flag.value) {
      const bottom_field_flag = get_n_bits(params, 1, 'bottom_field_flag');
      slice_header.push(bottom_field_flag);

      picture_structure = PictureStructTypes.PICT_TOP_FIELD + bottom_field_flag.value;
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
    if (bottom_field_pic_order_in_frame_present_flag.value === 1 && picture_structure === PictureStructTypes.PICT_FRAME) {
      slice_header.push(get_se_golomb(params, 'delta_pic_order_cnt_bottom'));
    }
  }

  
  if (pic_order_cnt_type.value === 1) {
    const delta_pic_order_always_zero = findNALTreeProperty(sps, 'delta_pic_order_always_zero') as Property;
    if (!delta_pic_order_always_zero.value) {
      slice_header.push(get_se_golomb(params, 'delta_pic_order_cnt[0]'));
      const bottom_field_pic_order_in_frame_present_flag = findNALTreeProperty(pps, 'bottom_field_pic_order_in_frame_present_flag') as Property;
      if (bottom_field_pic_order_in_frame_present_flag.value === 1 && picture_structure === PictureStructTypes.PICT_FRAME) {
        slice_header.push(get_se_golomb(params, 'delta_pic_order_cnt[1]'));
      }
    }
  }

  const redundant_pic_cnt_present_flag = findNALTreeProperty(pps, 'redundant_pic_cnt_present_flag') as Property;
  if (redundant_pic_cnt_present_flag.value) get_ue_golomb(params, 'redundant_pic_cnt');

  const slice_type_nos = ff_h264_golomb_to_pict_type[slice_type.value % 5] & 3;

  if (slice_type_nos === PictureTypes.AV_PICTURE_TYPE_B) slice_header.push(get_n_bits(params, 1, 'direct_spatial_mv_pred_flag'));

  
  const parse_ref_count_result = parse_ref_count(params, pps, slice_type_nos, picture_structure, slice_header);
  
  const ref_count: number[] = parse_ref_count_result.ref_count;
  const list_count: number = parse_ref_count_result.list_count;

  const ref_pic_list_reordering: Property[] = [];

  slice_header.push({
    key: generateUUID(),
    title: 'ref_pic_list_reordering',
    startBytes: Math.ceil(params.readBitIndex / 8),
    bits: 'N/A',
    children: ref_pic_list_reordering
  })

  if (slice_type_nos !== PictureTypes.AV_PICTURE_TYPE_I && slice_type_nos !== PictureTypes.AV_PICTURE_TYPE_SI) {
    for (let i = 0; i < list_count; i++) {
      const ref_pic_list_reordering_flag_l0 = get_n_bits(params, 1, 'ref_pic_list_reordering_flag_l0');
      ref_pic_list_reordering.push(ref_pic_list_reordering_flag_l0);

      if(ref_pic_list_reordering_flag_l0.value) {
        let reordering_of_pic_nums_idc;
        do {
          reordering_of_pic_nums_idc = get_ue_golomb(params, 'reordering_of_pic_nums_idc');
          ref_pic_list_reordering.push(reordering_of_pic_nums_idc);
          if (reordering_of_pic_nums_idc.value === 0 || reordering_of_pic_nums_idc.value === 1) {
            ref_pic_list_reordering.push(get_ue_golomb(params, 'abs_diff_pic_num_minus1'));
          }
  
          if (reordering_of_pic_nums_idc.value === 2) {
            ref_pic_list_reordering.push(get_ue_golomb(params, 'long_term_pic_num'));
          }
        } while(reordering_of_pic_nums_idc.value !== 3)
      }
    }

  }

  // if (slice_type_nos === PictureTypes.AV_PICTURE_TYPE_B) {
  //   const ref_pic_list_reordering_flag_l1 = get_n_bits(params, 1, 'ref_pic_list_reordering_flag_l1');
  //   ref_pic_list_reordering.push(ref_pic_list_reordering_flag_l1);

  //   if (ref_pic_list_reordering_flag_l1.value) {
  //     let reordering_of_pic_nums_idc;
  //     do {
  //       reordering_of_pic_nums_idc = get_ue_golomb(params, 'reordering_of_pic_nums_idc');
  //       ref_pic_list_reordering.push(reordering_of_pic_nums_idc);
  //       if (reordering_of_pic_nums_idc.value === 0 || reordering_of_pic_nums_idc.value === 1) {
  //         ref_pic_list_reordering.push(get_ue_golomb(params, 'abs_diff_pic_num_minus1'));
  //       }

  //       if (reordering_of_pic_nums_idc.value === 2) {
  //         ref_pic_list_reordering.push(get_ue_golomb(params, 'long_term_pic_num'));
  //       }
  //     } while(reordering_of_pic_nums_idc.value !== 3)
  //   }
  // }

  const weighted_pred_flag = findNALTreeProperty(pps, 'weighted_pred_flag') as Property;
  const weighted_bipred_idc = findNALTreeProperty(pps, 'weighted_bipred_idc') as Property;
  if ((weighted_pred_flag.value && slice_type_nos === PictureTypes.AV_PICTURE_TYPE_P) ||
    (weighted_bipred_idc.value === 1 && slice_type_nos === PictureTypes.AV_PICTURE_TYPE_B)) {
    const pred_weight_table: Property[] = parse_pred_weight_table(params, sps, pps, ref_count, slice_type_nos);

    slice_header.push({
      key: generateUUID(),
      title: 'pred_weight_table',
      startBytes: Math.ceil(params.readBitIndex / 8),
      bits: 'N/A',
      children: pred_weight_table
    });
  }

   const dec_ref_pic_marking: Property[] = parse_dec_ref_pic_marking(params)
   slice_header.push({
    key: generateUUID(),
    title: 'dec_ref_pic_marking',
    startBytes: Math.ceil(params.readBitIndex / 8),
    bits: 'N/A',
    children: dec_ref_pic_marking
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

  const slice_type = get_ue_golomb(params, 'slice_type'); // 由slice_type的值可以得到pict_type
  return pictureTypesMap[ff_h264_golomb_to_pict_type[(slice_type.value % 5)]];
}