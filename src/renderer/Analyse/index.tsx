import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Upload, Row, Col, Table, TableColumnsType } from 'antd';
import { InboxOutlined } from "@ant-design/icons";
import './index.scss';
import { NalUnitTypes, NalUnitTypesDescriptionMap } from '../types/nal-unit-types';
import NaluTree from './components/NaluTree';
import NaluHex from './components/NaluHex';
import { add_prefix_zero_bit } from "../utils/hadle-binary";
import { H264AnalyseResult, NaluDataStruct } from '../types/h264-analyse-result';
import { handleSPS } from "../utils/parse-sps";

const { Dragger } = Upload;

export default function AnalyseMp4() {
  const [fileList, setFileList] = useState<any[]>([]);
  const [h264AnalyseResult, setH264AnalyseResult] = useState<H264AnalyseResult>();
  const [analyseStatus, setAnalyseStatus] = useState<'start' | 'analysing' | 'done'>();
  const [currentNALData, setCurrentNALData] = useState<NaluDataStruct>({
    offset: '',
    nal_type: 0,
    data: [],
    nal_size: 0
  });
  const [firstAnalayseFlag, setFirstAnalayseFlag] = useState<boolean>(true);
  const [spsParseResult, setSpsParseResult] = useState<any>()

  const onStartAnalyse = useCallback(async () => {
    setAnalyseStatus('analysing');
    const reslut = await window.ffmpeg.analyseMp4(fileList[0].path);
    const parseResult: H264AnalyseResult = JSON.parse(reslut);

    console.log('h264AnalyseResult',parseResult);
    let offset = 0;
    parseResult.data.forEach(item => {
      const hex = offset.toString(16).toUpperCase();
      item.offset = `0x${  add_prefix_zero_bit(hex, 16 - hex.length)}`;
      offset += item.nal_size;
    });

    const spsNalu = parseResult.data.find(item => item.nal_type === NalUnitTypes.H264_NAL_SPS);
    if (spsNalu) {
      setSpsParseResult(handleSPS(spsNalu.data));
    }

    setH264AnalyseResult(parseResult);
    setAnalyseStatus('done');
    setFirstAnalayseFlag(false);
  }, [fileList])

  const onViewNALData = useCallback((NALData: NaluDataStruct) => {
    console.log(NALData);
    setCurrentNALData(NALData);
  }, [])

  const columns: TableColumnsType<NaluDataStruct> = useMemo(() => [
    {
      title: 'Offset',
      dataIndex: 'offset',
    },
    {
      title: 'NAL大小',
      width: 100,
      dataIndex: 'nal_size',
    },
    {
      title: 'NAL类型',
      dataIndex: 'nal_type',
      render: (_: any, row) => NalUnitTypesDescriptionMap[(row.nal_type)]
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_: any, row) => {
        return <Button type='link' onClick={() => onViewNALData(row)}>查看NAL数据</Button>
      }
    },
  ], [onViewNALData]);

  const uploadProps = useMemo(() => {
    return {
      name: "file",
      accept: ".mp4",
      beforeUpload: (file: any) => {
        console.log(file)
        setFileList([...fileList, file]);
        return false;
      }
    }
  }, [fileList]);

  useEffect(() => {
    setAnalyseStatus('start');
  }, [fileList])
  
  
  return <div className="analyse-mp4">
    {
      firstAnalayseFlag && <Dragger className="card-upload" {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击选择或者拖拽选择文件</p>
        <p className="ant-upload-hint">
          只能上传mp4格式文件
        </p>
      </Dragger>
    }
    
    <div className={`analyse-button-container ${firstAnalayseFlag ? '' : 'change-style'}`}>
      {fileList[0]?.path && !firstAnalayseFlag && <span className="filename">{fileList[0].path}</span>}
      <Button disabled={!fileList.length || analyseStatus !== 'start'} loading={analyseStatus === 'analysing'} type="primary" onClick={onStartAnalyse}>
        {analyseStatus === 'start' ? '开始解析' : analyseStatus === 'analysing' ? '解析中' : '解析完成'}
      </Button>
      {
        !firstAnalayseFlag && <Upload showUploadList={false} {...uploadProps}>
          <Button type="primary" className="reselect-file">重新选择文件</Button>
        </Upload>
      }
    </div>
    {
      !!h264AnalyseResult?.data?.length && <>
        <Row className="analyse-data-container" gutter={16}>
          <Col span={12}>
            <Table rowKey='offset' pagination={false} scroll={{ x: 500, y: 400 }} virtual columns={columns} dataSource={h264AnalyseResult.data} size="small" />
          </Col>
          <Col className="nalu-tree-container" span={12} style={{color: '#000'}} >
            <NaluTree data={currentNALData} spsParseResult={spsParseResult}/>
          </Col>
        </Row>
        <NaluHex data={currentNALData}/>
      </>
    }
  </div>
}