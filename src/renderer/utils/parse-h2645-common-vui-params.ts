import { get_n_bits } from './operate-n-bits';
import { get_ue_golomb } from './golomb';
import { h2645_pixel_aspect } from './h2645-data';
import { Property } from '../types/parse-nalu';
import { generateUUID } from './generate-uuid';

/**
 * 解析h264、h265公共的vui parameters
 * 
 * 参考了ffmpeg的libavcodec/h2645_vui.c文件
 * @param param nalu: number[]; readBitIndex: number; 注：readBitIndex 开始读取nalu的下标
 * @returns
 */
export function parse_h2645_common_vui_params(params:  { nalu: number[]; readBitIndex: number; }): Property[] {
  const common_vui_parameters: Property[] = [];
  let tempData: Omit<Property, 'value'> & { value: number };

  const aspect_ratio_info_present_flag = get_n_bits(params, 1, 'aspect_ratio_info_present_flag');
  aspect_ratio_info_present_flag.children = [];
  common_vui_parameters.push(aspect_ratio_info_present_flag);
  if (aspect_ratio_info_present_flag.value) {
    tempData = get_n_bits(params, 8, 'aspect_ratio_idc');
    aspect_ratio_info_present_flag.children.push(tempData);
    const aspect_ratio_idc = tempData.value;
      if (aspect_ratio_idc === 0xff) {
          const sar_width = get_n_bits(params, 16, 'sar_width');
          aspect_ratio_info_present_flag.children.push(sar_width);

          const sar_height = get_n_bits(params, 16, 'sar_height');
          aspect_ratio_info_present_flag.children.push(sar_height);

      } else if (aspect_ratio_idc < h2645_pixel_aspect.length) {
          const sar = h2645_pixel_aspect[aspect_ratio_idc];
          aspect_ratio_info_present_flag.children.push({
            key: generateUUID(),
            value: sar.num,
            title: 'sar_width',
            bits: 0,
            startBytes: 'N/A',
          });
          aspect_ratio_info_present_flag.children.push({
            key: generateUUID(),
            value: sar.den,
            title: 'sar_height',
            bits: 0,
            startBytes: 'N/A',
          });
      }
  }

  tempData = get_n_bits(params, 1, 'overscan_info_present_flag');
  common_vui_parameters.push(tempData);
  if (tempData.value) {
    tempData.children = [];
    tempData.children.push(get_n_bits(params, 1, 'overscan_appropriate_flag'));
  }

  const video_signal_type_present_flag = get_n_bits(params, 1, 'video_signal_type_present_flag');
  common_vui_parameters.push(video_signal_type_present_flag);
  if (video_signal_type_present_flag.value) {
    video_signal_type_present_flag.children = [];
    video_signal_type_present_flag.children.push(get_n_bits(params, 3, 'video_format'));
    video_signal_type_present_flag.children.push(get_n_bits(params, 1, 'video_full_range_flag'));

    const colour_description_present_flag = get_n_bits(params, 1, 'colour_description_present_flag')
    video_signal_type_present_flag.children.push(colour_description_present_flag);

    if (colour_description_present_flag.value) {
      colour_description_present_flag.children = [];
      colour_description_present_flag.children.push(get_n_bits(params, 8, 'colour_primaries'));
      colour_description_present_flag.children.push(get_n_bits(params, 8, 'transfer_characteristics'));
      colour_description_present_flag.children.push(get_n_bits(params, 8, 'matrix_coeffs'));
    }
  }

  const chroma_loc_info_present_flag = get_n_bits(params, 1, 'chroma_loc_info_present_flag');
  chroma_loc_info_present_flag.children = [];
  common_vui_parameters.push(chroma_loc_info_present_flag);

  if (chroma_loc_info_present_flag.value) {
    chroma_loc_info_present_flag.children.push(get_ue_golomb(params, 'chroma_sample_loc_type_top_field'));
    chroma_loc_info_present_flag.children.push(get_ue_golomb(params, 'chroma_sample_loc_type_bottom_field'));
  }

  return common_vui_parameters;
}