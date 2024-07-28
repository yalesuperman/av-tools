/**
 * nalu的数据以十六进制的形式进行显示
 */

import { useCallback, useEffect, useMemo, useRef } from "react";
import VirtualList from 'rc-virtual-list';
import { H264AnalyseResult, NaluDataStruct } from '../../../types/h264-analyse-result';
import './index.scss';
import { generateUUID } from "../../../utils/generate-uuid";
import { Property } from "../../../types/parse-nalu";
import { add_prefix_zero_bit } from "../../../utils/hadle-binary";

interface Props {
  data: NaluDataStruct;
  h264AnalyseResult: H264AnalyseResult;
  selectedNalTreeItem: Property | undefined;
}

export default function NaluHex (props: Props) {
  const { data, h264AnalyseResult, selectedNalTreeItem } = props;
  const virtualListRef = useRef<any>(null);

  /**
   * 将bytes的一维数组转换成二维数组
   */
  const transformData = useCallback((bytes: number[]) => {
    const result = [];
    for (let i = 0; i < Math.ceil(bytes.length / 16); i++) {
      const temp: { id: string; data: { id: string; data: number }[] } = {
        id: generateUUID(),
        data: []
      };
      for (let j = i * 16; j < (i + 1) * 16; j++) {
        if (bytes[j] !== undefined) {
          temp.data.push({
            id: generateUUID(),
            data: bytes[j]
          })
        }
      }
      result.push(temp);
    }
    return result;
  }, []);

  const NALDataColumns = useMemo(() => {
    return ['address', '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0A', '0B', '0C', '0D', '0E', '0F'];
  }, []);

  const renderInfo = useMemo(() => {
    if (data.offset) {
      // 需要从上一个NAL单元里面获取的字节数量
      const prevNum = parseInt(data.offset, 16) % 16;
      // 需要从下一个NAL单元里面获取的字节数量
      const nextNum = 16 - ((data.nal_size + prevNum) % 16);
      const index = h264AnalyseResult.data.findIndex((item) => item.offset === data.offset);
      let tempBytes: number[] = [];
      if (index > 0)
        tempBytes = h264AnalyseResult.data[index - 1].data.slice(h264AnalyseResult.data[index - 1].nal_size - prevNum, h264AnalyseResult.data[index - 1].nal_size);
      if ((index + 1) < h264AnalyseResult.data.length)
        tempBytes = tempBytes.concat(data.data, h264AnalyseResult.data[index + 1].data.slice(0, nextNum));
      else 
        tempBytes = tempBytes.concat(data.data);
      const hex = (parseInt(data.offset, 16) - parseInt(data.offset, 16) % 16).toString(16).toUpperCase();
      return {
        renderBytes: transformData(tempBytes),
        prevNum,
        currentNum: data.nal_size,
        nextNum,
        startMemoryAddress: `0x${  add_prefix_zero_bit(hex, 16 - hex.length)}`
      }
    }
    return {
      renderBytes: [],
      prevNum: 0,
      currentNum: 0,
      nextNum: 0,
      startMemoryAddress: `0x0`
    }
  }, [data.data, data.nal_size, data.offset, h264AnalyseResult?.data, transformData]);

  const cacluteMemoryAddress = useCallback((rowIndex: number) => {
    const hex = (parseInt(renderInfo.startMemoryAddress, 16) + rowIndex * 16).toString(16).toUpperCase();
    return `0x${  add_prefix_zero_bit(hex, 16 - hex.length)}`;
  }, [renderInfo.startMemoryAddress]);

  const setByteSpanClassName = useCallback((rowIndex: number, rowItemIndex: number) => {
    let classname = (renderInfo.prevNum < (rowIndex * 16 + rowItemIndex + 1)) && ((rowIndex * 16 + rowItemIndex) < (renderInfo.prevNum + renderInfo.currentNum)) ? 'current-nal-data': '';
    if (selectedNalTreeItem && selectedNalTreeItem?.startBytes !== 'N/A' && selectedNalTreeItem?.bits !== 'N/A') {
      if (((renderInfo.prevNum + selectedNalTreeItem.startBytes) < (rowIndex * 16 + rowItemIndex + 1)) && ((rowIndex * 16 + rowItemIndex) < (renderInfo.prevNum + selectedNalTreeItem.startBytes + Math.ceil(selectedNalTreeItem.bits / 8))) ) {
        classname += ' selectedByte'
      }
    }
    return classname;
  }, [renderInfo.currentNum, renderInfo.prevNum, selectedNalTreeItem]);


  useEffect(() => {
    console.log(virtualListRef, 3424)
    if (virtualListRef.current) {
      virtualListRef.current.scrollTo(0);
    }
  }, [data]);

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
        <VirtualList ref={virtualListRef} data={renderInfo.renderBytes} height={400} itemHeight={20} itemKey="id">
          {(row: { id: string; data: { id: string; data: number }[] }, rowIndex) => {
            return <div className="naldata-row-content" key={row.id}>
              <span key={rowIndex} className="row-title">{cacluteMemoryAddress(rowIndex)}</span>
              {
                row.data.map((item, index) => {
                  const temp = parseInt(item.data as any, 10).toString(16).toLocaleUpperCase();
                  return <span
                    key={item.id}
                    className={setByteSpanClassName(rowIndex, index)}
                    >{temp.length === 1 ? '0' : ''}{temp}
                  </span>
                })
              }
            </div>
          }}
        </VirtualList>
      </div>
    </div>
  </div>
}