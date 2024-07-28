
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import './index.scss';

type MenuType = {
  title: string;
  description: string;
  link: string
}

export default function Home() {
  
  const menus: MenuType[] = useMemo(() => {
    return [{
      title: '音视频编辑',
      description: '对音视频进行裁剪、格式转换等编辑操作',
      link: '/edit-media'
    }, {
      title: 'H264 Viewer',
      description: '对视频中H264数据进行分析',
      link: '/h264-analayse'
    }]
  }, []);

  return <div className='home-page'>
    <div className='cards-container'>
      <div className="cards">
        {
          menus.map(menu => <Link key={menu.link} to={menu.link}>
            <div className="card">
              <p className="card-title">{menu.title}</p>
              <p className="card-description">{menu.description}</p>
            </div>
          
          </Link>)
        }
      </div>
    </div>
  </div>
}