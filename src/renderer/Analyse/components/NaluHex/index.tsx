/**
 * nalu的数据以十六进制的形式进行显示
 */

import { useMemo } from "react";
import VirtualList from 'rc-virtual-list';
import { NaluDataStruct } from '../../../types/h264-analyse-result';
import './index.scss';
import { generateUUID } from "../../../utils/generate-uuid";

interface Props {
  data: NaluDataStruct
}

export default function NaluHex (props: Props) {
  const { data } = props;

  const renderData: any[] = useMemo(() => {
    if (!data?.data) return [];
    const result = [];
    for (let i = 0; i < Math.ceil(data.data.length / 16); i++) {
      const temp: { id: string; data: { id: string; data: number }[] } = {
        id: generateUUID(),
        data: []
      };
      for (let j = i * 16; j < (i + 1) * 16; j++) {
        if (data.data[j] !== undefined) {
          temp.data.push({
            id: generateUUID(),
            data: data.data[j]
          })
        }
      }
      result.push(temp);
    }
    return result;
  }, [data.data]);

  const NALDataColumns = useMemo(() => {
    return ['row', '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0A', '0B', '0C', '0D', '0E', '0F'];
  }, []);

  return <div className="nalu-hex-view-container">
    <p className="hex-view-title">Hex View</p>
    <div className="naldata-column-title">
      {
        NALDataColumns.map((item) => {
          return <span key={item}>{item}</span>
        })
      }
    </div>
    <div className="naldata-area-container">
      <div className="naldata-content">
        <VirtualList data={renderData} height={400} itemHeight={20} itemKey="id">
          {(row: { id: string; data: { id: string; data: number }[] }, rowIndex) => {
            return <div className="naldata-row-content" key={row.id}>
              <span key={rowIndex} className="row-title">{rowIndex}</span>
              {
                row.data.map((item) => {
                  const temp = parseInt(item.data as any, 10).toString(16).toLocaleUpperCase();
                  return <span key={item.id}>{temp.length === 1 ? '0' : ''}{temp}</span>
                })
              }
            </div>
          }}
        </VirtualList>
      </div>
    </div>
  </div>
}