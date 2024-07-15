
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
      title: '格式转换',
      description: '将音视频由一种格式转换成其它的格式，比如：MP4转为MP3',
      link: '/format-transform'
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