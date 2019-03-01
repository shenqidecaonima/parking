import React, { Component } from 'react';
import './topBanner.css';
import Logo from '../pic/logo.jpg';

export default class TopBanner extends Component {
  render() {
    return (
      <div>
        <div className="topBanner">
          <div className="logo">
            <img src={Logo} alt="logo"/>
          </div>
          <div className="title">
            <span>车位通</span>
          </div>

          <div className="menuMap">
            <ul>
              <a href="#"><li className="menuMap">首页</li></a>
              <a href="#"><li className="menuMap">排行榜</li></a>
              <a href="#"><li className="menuMap">我的车位</li></a>
              <a href="#"><li className="menuMap">登录</li></a>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
