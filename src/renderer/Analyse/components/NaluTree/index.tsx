import { Tree } from 'antd';
import { useCallback, useEffect, useMemo } from 'react';
import { NalUnitTypes } from '../../../types/nal-unit-types';
import { handleSPS } from '../../../utils/parse-sps';
import { handlePPS } from '../../../utils/parse-pps';
import { handleSEI } from '../../../utils/parse-sei';
import { getNaluCommonStruct } from '../../../utils/parse-nalu-common';
import './index.scss';
import { NaluDataStruct } from '../../../types/h264-analyse-result';
import { Property } from '../../../types/parse-nalu';
import { ebsp2Rbsp } from '../../../utils/ebsp-to-rbsp';
import { handleSlice } from '../../../utils/parse-slice';

interface Props {
  data: NaluDataStruct,
  spsParseResult: Property[];
  ppsParseResult: Property[];
  onSelectNalTreeItem: (selectedNalTreeItem: Property | undefined) => void;
}

export default function NaluTree(props: Props) {
  const { data, spsParseResult, ppsParseResult, onSelectNalTreeItem } = props;

  const treeData: any[] = useMemo(() => {
    let temp: any = [];
    const rbspData = ebsp2Rbsp(data.data)
    switch(Number(data.nal_type)) {
      case NalUnitTypes.H264_NAL_SPS:
        temp = handleSPS(rbspData);
        break;
      case NalUnitTypes.H264_NAL_PPS:
        temp = handlePPS(rbspData, spsParseResult);
        break;
      case NalUnitTypes.H264_NAL_SEI:
        temp = handleSEI(rbspData);
        break;
      case NalUnitTypes.H264_NAL_SLICE:
      case NalUnitTypes.H264_NAL_IDR_SLICE:
      case NalUnitTypes.H264_NAL_DPA:
      case NalUnitTypes.H264_NAL_DPB:
      case NalUnitTypes.H264_NAL_DPC:
        temp = handleSlice(rbspData, spsParseResult, ppsParseResult);
        break;
      default:
        temp =  getNaluCommonStruct(rbspData);
    }
    return temp;
  }, [data.data, data.nal_type, ppsParseResult, spsParseResult]);

  const onSelect = useCallback((_selectedKeys: any, { selectedNodes }: any) => {
    onSelectNalTreeItem(selectedNodes[0])
  }, [onSelectNalTreeItem]);

  useEffect(() => {
    onSelectNalTreeItem(undefined);
  }, [onSelectNalTreeItem, data]);

  return <div className='nal-struct-container'>
    <p className="nal-struct-title">NAL {data.offset}</p>
    <Tree
      showLine
      showIcon={false}
      blockNode
      height={400}
      onSelect={onSelect}
      titleRender={(treeNodeProps) => <div className='tree-node-item'>
        <span>{treeNodeProps.title}</span>
        {
          treeNodeProps.bits !== 'N/A' && <div style={{ minWidth: 120, display: 'flex', justifyContent: 'space-between' }}>
          <span>{treeNodeProps.value}</span>
          <span>{` (${treeNodeProps.descriptor? `${treeNodeProps.descriptor} ` : ''}${treeNodeProps.bits} bits)`}</span>
        </div>
        }
        
      </div>}
      treeData={treeData}
    />
  </div>
}