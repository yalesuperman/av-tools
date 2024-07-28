import { Button, Form, Input, TimePicker } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import './index.scss';
import { FolderOpenOutlined, FolderViewOutlined } from '@ant-design/icons';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};

interface Props {
  fileUrl: string;
}

export default function Settings(props: Props) {
  const { fileUrl } = props;
  const [form] = Form.useForm();
  const [processStatus, setProcessStatus] = useState<'start' | 'processing' | 'success' | 'error'>('start');
  const [generatedFileUrl, setGeneratedFileUrl] = useState<string>('');

  const onFinish = useCallback(async (fieldsValue: any) => {
    console.log(fieldsValue, 'fieldsValue')
    setProcessStatus('processing');
    const startTime = fieldsValue.timePicker[0].format('HH:mm:ss');
    const endTime = fieldsValue.timePicker[1].format('HH:mm:ss');
    const outputPath = `${fieldsValue.outputPath  }/${  fieldsValue.outputFilename}`;
    
    const res = await window.ffmpeg.editMedia(["-i", fileUrl, "-ss", startTime, "-to", endTime, outputPath]);
    if (res === 'success') {
      setGeneratedFileUrl(outputPath);
      setProcessStatus('success');
    } else {
      setGeneratedFileUrl(''); 
      setProcessStatus('error')
    }

    console.log(res, 'res')
  }, [fileUrl]);

  useEffect(() => {
    console.log(222111)
    setProcessStatus('start');
  }, [fileUrl])

  const selectDirector = useCallback(async () => {
    const res = await window.ffmpeg.selectDirector();
    form.setFieldValue('outputPath', res);
  }, [form]);

  const viewFile = useCallback(() => {
    window.ffmpeg.openFinder(generatedFileUrl);
  }, [generatedFileUrl]);

  return <Form
    {...formItemLayout}
    form={form}
    onFinish={onFinish}
    style={{ width: 600 }}
    className='settings-form'
  >
    <Form.Item name="timePicker" label="截取时间段">
      <TimePicker.RangePicker placeholder={["开始时间", "结束时间"]} />
    </Form.Item>

    <Form.Item name="outputPath" label="保存路径">
      <Input placeholder='请选择输出路径' readOnly suffix={<FolderOpenOutlined />} onClick={selectDirector}/>
    </Form.Item>

    <Form.Item name="outputFilename" label="生成的文件名">
      <Input placeholder='请输入新文件名'/>
    </Form.Item>

    <Form.Item wrapperCol={{ xs: { span: 24, offset: 0 }, sm: { span: 16, offset: 4 } }}>
      <Button type="primary" htmlType="submit" loading={processStatus === 'processing'} disabled={processStatus !== 'start'}>
        确定
      </Button>
      {
        !!generatedFileUrl && <span className='generate-file-path'>生成文件的路径：{generatedFileUrl}<FolderViewOutlined onClick={viewFile} /></span>
      }
    </Form.Item>
  </Form>
};