/** NAL Unit类型的枚举值 */
export enum NalUnitTypes {
  H264_NAL_UNSPECIFIED     = 0,
  H264_NAL_SLICE           = 1,
  H264_NAL_DPA             = 2,
  H264_NAL_DPB             = 3,
  H264_NAL_DPC             = 4,
  H264_NAL_IDR_SLICE       = 5,
  H264_NAL_SEI             = 6,
  H264_NAL_SPS             = 7,
  H264_NAL_PPS             = 8,
  H264_NAL_AUD             = 9,
  H264_NAL_END_SEQUENCE    = 10,
  H264_NAL_END_STREAM      = 11,
  H264_NAL_FILLER_DATA     = 12,
  H264_NAL_SPS_EXT         = 13,
  H264_NAL_PREFIX          = 14,
  H264_NAL_SUB_SPS         = 15,
  H264_NAL_DPS             = 16,
  H264_NAL_RESERVED17      = 17,
  H264_NAL_RESERVED18      = 18,
  H264_NAL_AUXILIARY_SLICE = 19,
  H264_NAL_EXTEN_SLICE     = 20,
  H264_NAL_DEPTH_EXTEN_SLICE = 21,
  H264_NAL_RESERVED22      = 22,
  H264_NAL_RESERVED23      = 23,
  H264_NAL_UNSPECIFIED24   = 24,
  H264_NAL_UNSPECIFIED25   = 25,
  H264_NAL_UNSPECIFIED26   = 26,
  H264_NAL_UNSPECIFIED27   = 27,
  H264_NAL_UNSPECIFIED28   = 28,
  H264_NAL_UNSPECIFIED29   = 29,
  H264_NAL_UNSPECIFIED30   = 30,
  H264_NAL_UNSPECIFIED31   = 31,
};

/** NAL Unit类型对应的释义 */
export const NalUnitTypesDescriptionMap: Record<any, string> = {
  [NalUnitTypes.H264_NAL_UNSPECIFIED]: 'Unspecified',
  [NalUnitTypes.H264_NAL_SLICE]: 'Coded slice of a non-IDR picture',
  [NalUnitTypes.H264_NAL_DPA]: 'Coded slice data partition A',
  [NalUnitTypes.H264_NAL_DPB]: 'Coded slice data partition B',
  [NalUnitTypes.H264_NAL_DPC]: 'Coded slice data partition C',
  [NalUnitTypes.H264_NAL_IDR_SLICE]: 'Coded slice of an IDR picture',
  [NalUnitTypes.H264_NAL_SEI]: 'Supplemental enhancement information(SEI)',
  [NalUnitTypes.H264_NAL_SPS]: 'Sequence parameter set(SPS)',
  [NalUnitTypes.H264_NAL_PPS]: 'Picture parameter set(PPS)',
  [NalUnitTypes.H264_NAL_AUD]: 'Access unit delimiter(分隔符)',
  [NalUnitTypes.H264_NAL_END_SEQUENCE]: 'End of sequence',
  [NalUnitTypes.H264_NAL_END_STREAM]: 'End of stream',
  [NalUnitTypes.H264_NAL_FILLER_DATA]: 'Filler data',
  [NalUnitTypes.H264_NAL_SPS_EXT]: 'Sequence parameter set extension',
  [NalUnitTypes.H264_NAL_PREFIX]: 'Prefix NAL unit',
  [NalUnitTypes.H264_NAL_SUB_SPS]: 'Subset sequence parameter set',
  [NalUnitTypes.H264_NAL_DPS]: 'Depth parameter set',
  [NalUnitTypes.H264_NAL_RESERVED17]: 'Reserved',
  [NalUnitTypes.H264_NAL_RESERVED18]: 'Reserved',
  [NalUnitTypes.H264_NAL_AUXILIARY_SLICE]: 'Coded slice of an auxiliary coded picture without partitioning',
  [NalUnitTypes.H264_NAL_EXTEN_SLICE]: 'Coded slice extension',
  [NalUnitTypes.H264_NAL_DEPTH_EXTEN_SLICE]: 'Coded slice extension for depth view components',
  [NalUnitTypes.H264_NAL_RESERVED22]: 'Reserved',
  [NalUnitTypes.H264_NAL_RESERVED23]: 'Reserved',
  [NalUnitTypes.H264_NAL_UNSPECIFIED24]: 'Unspecified',
  [NalUnitTypes.H264_NAL_UNSPECIFIED25]: 'Unspecified',
  [NalUnitTypes.H264_NAL_UNSPECIFIED26]: 'Unspecified',
  [NalUnitTypes.H264_NAL_UNSPECIFIED27]: 'Unspecified',
  [NalUnitTypes.H264_NAL_UNSPECIFIED28]: 'Unspecified',
  [NalUnitTypes.H264_NAL_UNSPECIFIED29]: 'Unspecified',
  [NalUnitTypes.H264_NAL_UNSPECIFIED30]: 'Unspecified',
  [NalUnitTypes.H264_NAL_UNSPECIFIED31]: 'Unspecified',
}

export const RBSPSyntaxStructureMap: Record<any, string> = {
  [NalUnitTypes.H264_NAL_SLICE]: 'slice_layer_without_partitioning_rbsp',
  [NalUnitTypes.H264_NAL_DPA]: 'slice_data_partition_a_layer_rbsp',
  [NalUnitTypes.H264_NAL_DPB]: 'slice_data_partition_b_layer_rbsp',
  [NalUnitTypes.H264_NAL_DPC]: 'slice_data_partition_c_layer_rbsp',
  [NalUnitTypes.H264_NAL_IDR_SLICE]: 'slice_layer_without_partitioning_rbsp',
  [NalUnitTypes.H264_NAL_SEI]: 'sei_rbsp',
  [NalUnitTypes.H264_NAL_SPS]: 'seq_parameter_set_rbsp',
  [NalUnitTypes.H264_NAL_PPS]: 'pic_parameter_set_rbsp',
  [NalUnitTypes.H264_NAL_AUD]: 'access_unit_delimiter_rbsp',
  [NalUnitTypes.H264_NAL_END_SEQUENCE]: 'end_of_seq_rbsp',
  [NalUnitTypes.H264_NAL_END_STREAM]: 'end_of_stream_rbsp',
  [NalUnitTypes.H264_NAL_FILLER_DATA]: 'filler_data_rbsp',
  [NalUnitTypes.H264_NAL_SPS_EXT]: 'seq_parameter_set_extension_rbsp',
  [NalUnitTypes.H264_NAL_PREFIX]: 'prefix_nal_unit_rbsp',
  [NalUnitTypes.H264_NAL_SUB_SPS]: 'subset_seq_parameter_set_rbsp',
  [NalUnitTypes.H264_NAL_DPS]: 'depth_parameter_set_rbsp',
  [NalUnitTypes.H264_NAL_AUXILIARY_SLICE]: 'slice_layer_without_partitioning_rbsp',
  [NalUnitTypes.H264_NAL_EXTEN_SLICE]: 'slice_layer_extension_rbsp',
  [NalUnitTypes.H264_NAL_DEPTH_EXTEN_SLICE]: 'slice_layer_extension_rbsp'
}