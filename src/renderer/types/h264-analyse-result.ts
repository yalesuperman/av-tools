/**
 * 该文件用于定义解析MP4视频后生成的数据结构
 */
export type NaluDataStruct = {
  /** 通过nal_size计算得到 */
  offset?: string;
  /** nal的类型 */
  nal_type: number;
  /** 字节数量 */
  nal_size: number;
  /** nalu数据组成的数组 */
  data: number[]
}

export type H264AnalyseResult = {
  profile_idc: number;
  data: NaluDataStruct[];
}