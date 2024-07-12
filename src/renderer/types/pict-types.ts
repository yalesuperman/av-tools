// const uint8_t ff_h264_golomb_to_pict_type[5] = {
//   AV_PICTURE_TYPE_P, AV_PICTURE_TYPE_B, AV_PICTURE_TYPE_I,
//   AV_PICTURE_TYPE_SP, AV_PICTURE_TYPE_SI
// }

export enum  PictureTypes {
  AV_PICTURE_TYPE_NONE = 0, // < Undefined
  AV_PICTURE_TYPE_I,     // < Intra
  AV_PICTURE_TYPE_P,     // < Predicted
  AV_PICTURE_TYPE_B,     // < Bi-dir predicted
  AV_PICTURE_TYPE_S,     // < S(GMC)-VOP MPEG-4
  AV_PICTURE_TYPE_SI,    // < Switching Intra
  AV_PICTURE_TYPE_SP,    // < Switching Predicted
  AV_PICTURE_TYPE_BI,    // < BI type
}

export const pictureTypesMap: Record<number, string> = {
  1: 'I',
  2: 'P',
  3: "B",
  4: "S",
  5: "SI",
  6: "SP",
  7: "BI"
}

export const ff_h264_golomb_to_pict_type = [
  PictureTypes.AV_PICTURE_TYPE_P,
  PictureTypes.AV_PICTURE_TYPE_B,
  PictureTypes.AV_PICTURE_TYPE_I,
  PictureTypes.AV_PICTURE_TYPE_SP,
  PictureTypes.AV_PICTURE_TYPE_SI
];