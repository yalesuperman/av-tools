/**
 * 将nalu二进制数据进行解析后每一项代表的含义的结构定义
 */
export type Property = {
  key: string;
  value?: number | Property[] | string;
  children?: Property[];
  bits: number | 'N/A'; // 该属性值所占用的位数，单位：位
  startBytes: number | 'N/A'; // 该值在nalu中的是从第几个字节开始的，单位：字节
  title: string; // 属性名
  descriptor?: string; // 描述符
}