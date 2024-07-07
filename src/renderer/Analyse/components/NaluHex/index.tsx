/**
 * nalu的数据以十六进制的形式进行显示
 */

import { useMemo } from "react";
import { AnalyseMediaDataItem } from '../NaluTree';
import './index.scss';

interface Props {
  data: AnalyseMediaDataItem
}

export default function NaluHex (props: Props) {
  const { data } = props;

  const rows = useMemo(() => {
    if (!data?.data) return [];
    const temp: number[] = [];
    for (let i = 0; i < Math.ceil(data.data.length / 16); i++) {
      temp.push(i);
    }
    return temp;
  }, [data.data])

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
      <div className="naldata-row-title">
        {
          rows.map((row) => {
            return <span>{row}</span>
          })
        }
      </div>
      <div className="naldata-content">
        {
          rows.map((row) => {
            return <div className="naldata-row-content">
                {
                  data.data.slice(row * 16, (row + 1) * 16).map((item, index) => {
                    const temp = parseInt(item as any, 10).toString(16).toLocaleUpperCase();
                    return <span key={index}>{temp.length === 1 ? '0' : ''}{temp}</span>
                  })
                }
              </div>
          })
        }
      </div>
    </div>
  </div>
}