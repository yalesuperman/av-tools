import { InboxOutlined } from "@ant-design/icons";
import { Upload } from "antd";
import { useMemo, useState } from "react";
import Settings from './components/Settings';
import './index.scss';

const { Dragger } = Upload;

export default function EditMedia() {
  const [fileList, setFileList] = useState<any[]>([]);
  
  const uploadProps = useMemo(() => {
    return {
      name: "file",
      accept: ".mp4",
      beforeUpload: (file: any) => {
        console.log(file)
        setFileList([file]);
        return false;
      }
    }
  }, []);

  return <div className="edit-media-page">
    <div className="upload-container">
      <Dragger maxCount={1} className="card-upload" {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击选择或者拖拽选择源文件</p>
      </Dragger>
    </div>
    <Settings fileUrl={fileList[0]?.path}/>
  </div>
}