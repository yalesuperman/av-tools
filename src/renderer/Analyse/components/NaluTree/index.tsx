import { Tree } from 'antd';
import { useCallback, useMemo } from 'react';
import { NalUnitTypes } from '../../../types/nal-unit-types';
import { handleSPS } from '../../../utils/parse-sps';
import { handlePPS } from '../../../utils/parse-pps';
import { getNaluCommonStruct } from '../../../utils/parse-nalu-common';
import './index.scss';
import { NaluDataStruct } from '../../../types/h264-analyse-result';
import { Propery } from '../../../types/parse-nalu';

interface Props {
  data: NaluDataStruct,
  spsParseResult: Propery[];
}

export default function NaluTree(props: Props) {
  const { data, spsParseResult } = props;

  /**
 * 将data.data的Ebsp数据转换成rbsp数据
 */
  const rbspData = useMemo(() => {
    if (!data?.data) return [];
    
    const tempRbspData = [];
    let i = 0;
    while(i + 2 < data.data.length) {
      if ( data.data[i] === 0x00 &&  data.data[i + 1] === 0x00 &&  data.data[i + 2] === 0x03) {
        tempRbspData.push(data.data[i++]);
        tempRbspData.push(data.data[i++]);
        i++; // remove emulation_prevention_three_byte
      } else tempRbspData.push(data.data[i++]);
    }
    while (i < data.data.length) {
    tempRbspData.push(data.data[i++]);
    }
    return tempRbspData;
  }, [data.data]);

  const treeData: any[] = useMemo(() => {
    let temp: any = [];
    switch(Number(data.nal_type)) {
      case NalUnitTypes.H264_NAL_SPS:
        temp = handleSPS(rbspData);
        break;
      case NalUnitTypes.H264_NAL_PPS:
        temp = handlePPS(rbspData, spsParseResult);
        break;
      default:
        temp =  getNaluCommonStruct(rbspData);
    }
    return temp;
  }, [data.nal_type, rbspData, spsParseResult]);

  const onSelect = useCallback(() => {
    console.log('onSelect');
  }, []);

  return <div className='nal-struct-container'>
    <p className="nal-struct-title">NAL</p>
    <Tree
      showLine
      showIcon={false}
      blockNode
      height={400}
      onSelect={onSelect}
      titleRender={(treeNodeProps) => <div className='tree-node-item'>
        <span>{treeNodeProps.title}</span>
        <span>{treeNodeProps.bits !== 'N/A' && ` ${treeNodeProps.value} (${treeNodeProps.variableBits? 'variable ' : ''}${treeNodeProps.bits} bits)`}</span>
      </div>}
      treeData={treeData}
    />
  </div>
}