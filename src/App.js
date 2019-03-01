import React, { Component } from 'react';
import './App.css';
import TopBanner from './TopBanner/topBanner.js';
import FootBanner from './FootBanner/footbanner.js';
import parking01 from './pic/parking01.jpg';
import parking02 from './pic/parking02.jpg';
import parking04 from './pic/parking04.jpg';
import parking05 from './pic/parking05.jpg';
import parking06 from './pic/parking06.jpg';
import { Carousel } from 'antd';
import { Input } from 'antd';
import { Table } from 'antd';
import { MiniArea } from 'ant-design-pro/lib/Charts';
import moment from 'moment';

const Search = Input.Search;
const data = [{
  key: '1',
  rank: '1',
  place: '某小区',
  address: '某小路',
  currentPrice: 10,
  slope: '+10%',
}, {
  key: '2',
  rank: '2',
  place: '某小区',
  address: '某小路',
  currentPrice: 10,
  slope: '+10%',
}, {
  key: '3',
  rank: '3',
  place: '某小区',
  address: '某小路',
  currentPrice: 10,
  slope: '+10%',
},{
  key: '4',
  rank: '4',
  place: '某小区',
  address: '某小路',
  currentPrice: 10,
  slope: '+10%',
},{
  key: '5',
  rank: '5',
  place: '某小区',
  address: '某小路',
  currentPrice: 10,
  slope: '+10%',
},{
  key: '6',
  rank: '6',
  place: '某小区',
  address: '某小路',
  currentPrice: 10,
  slope: '+10%',
}];


const columns = [{
  title: '排名',
  dataIndex: 'rank',
  key: 'rank',
}, {
  title: '车位地址',
  dataIndex: 'place',
  key: 'place',
}, {
  title: '车位所在小区',
  dataIndex: 'address',
  key: 'address',
}, {
  title: '当前价格',
  key: 'currentPrice',
  dataIndex: 'currentPrice',
}, {
  title: '收益涨幅',
  dataIndex: 'slope',
},{
  title: '收益简图',
  dataIndex:'map',
  render: maps => (
    <MiniArea
      line
      color="#cceafe"
      height={45}
      data={visitData}
      />
  ),
}];

const visitData = [];
const beginDay = new Date().getTime();
for (let i = 0; i < 20; i += 1) {
  visitData.push({
    x: moment(new Date(beginDay + (1000 * 60 * 60 * 24 * i))).format('YYYY-MM-DD'),
    y: Math.floor(Math.random() * 100) + 10,
  });
}

class App extends Component {
  render() {
    return (
      <div class="main">
        <TopBanner />
        <div className="backImg">
          <Carousel autoplay>
            <div><img className="imgList" src={parking01} alt="这是一幅图"/></div>
            <div><img className="imgList" src={parking02} alt="It is a pic"/></div>
          </Carousel>
        </div>

        <div className="m1">
          <div className="m2">
            <div className="buyPart">
              <div>
                <div className="buyPartHeader">
                  <h2>我要买车位</h2>
                </div>
                <div className="searchBar">
                  <Search
                  placeholder="input search text"
                  onSearch={value => console.log(value)}
                  enterButton
                  />
                </div>
              </div>

              <div className="buyPartTable">
                <ul className="buyPartTableHeader" id="priceSection">
                  <li className="buyPartTable" id="priceSection">价格</li>
                  <li className="buyPartTable" id="priceSection">10万</li>
                  <li className="buyPartTable" id="priceSection">20万</li>
                  <li className="buyPartTable" id="priceSection">30万</li>
                </ul>
                <ul className="buyPartTableHeader" id="placeSection">
                  <li className="buyPartTable" id="placeSection">地区</li>
                  <li className="buyPartTable" id="placeSection">西湖区</li>
                  <li className="buyPartTable" id="placeSection">上城区</li>
                  <li className="buyPartTable" id="placeSection">下城区</li>
                </ul>
                <ul className="buyPartTableHeader" id="blockSection">
                  <li className="buyPartTable" id="blockSection">街道/小区</li>
                  <li className="buyPartTable" id="blockSection">A</li>
                  <li className="buyPartTable" id="blockSection">B</li>
                  <li className="buyPartTable" id="blockSection">C</li>
                </ul>
                <ul className="buyPartTableHeader" id="speSection">
                  <li className="buyPartTable" id="speSection">特色</li>
                  <li className="buyPartTable" id="speSection">A</li>
                  <li className="buyPartTable" id="speSection">B</li>
                  <li className="buyPartTable" id="speSection">C</li>
                </ul>
              </div>
            </div>

            <div className="registerPart">
              <div className="registerHeader"><h2>注册</h2></div>
              <form className="registerForm" action="#" method="get">
                <span className="registerForm">手机号:</span>
                <input className="registerForm" type="number" name="accountName" placeholder="请输入手机号"></input>
                <span className="registerForm">短信验证:</span>
                <input className="registerForm"  type="text" name="vCode" placeholder="请输入短信验证码"></input>
                <span className="registerForm">验证码:</span>
                <input className="registerForm" type="text" name="capcha" placeholder="请输入验证码"></input>
                <button className="registerForm" id="registerButton" type="submit" value="submit">注册</button>
              </form>
            </div>
          </div>

          <div className="pickSection">
            <ul>

              <li>
                <div className="pickChildSection" id="pickSection1">
                  <ul className="pickUl">
                    <li><h2>家庭自用</h2></li>
                    <li>
                      <a href="#">
                        <div id="pickSectionImg">
                          <img src={parking04} alt="这是一幅图"/>
                          <p className="pickButton">更多详情</p>
                        </div>
                      </a>
                    </li>
                    <li>
                      <div className="pickInfo">
                        <div id='info1'>
                          <span>A小区</span>
                        </div>
                        <div id='info2'>
                          <span>B小区</span>
                        </div>
                        <div id='info3'>
                          <span>C小区</span>
                        </div>
                        <div id='info4'>
                          <span>D小区</span>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </li>

              <li>
                <div className="pickChildSection" id="pickSection2">
                  <ul className="pickUl">
                    <li><h2>投资理财</h2></li>
                    <li>
                      <div id="pickSectionImg">
                        <img src={parking05} alt="这是一幅图"/>
                        <button className="pickButton">更多详情</button>
                      </div>
                    </li>
                    <li>
                      <div className="pickInfo">
                        <div id='info1'>
                          <span>A小区</span>
                        </div>
                        <div id='info2'>
                          <span>B小区</span>
                        </div>
                        <div id='info3'>
                          <span>C小区</span>
                        </div>
                        <div id='info4'>
                          <span>D小区</span>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </li>

              <li>
                <div className="pickChildSection" id="pickSection3">
                  <ul className="pickUl">
                    <li><h2>租赁外用</h2></li>
                    <li>
                      <div id="pickSectionImg">
                        <img src={parking06} alt="这是一幅图"/>
                        <button className="pickButton">更多详情</button>
                      </div>
                    </li>
                    <li>
                      <div className="pickInfo">
                        <div id='info1'>
                          <span>A小区</span>
                        </div>
                        <div id='info2'>
                          <span>B小区</span>
                        </div>
                        <div id='info3'>
                          <span>C小区</span>
                        </div>
                        <div id='info4'>
                          <span>D小区</span>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>


          <div className="listSection">
            <h2 className="top10">前10收益小区</h2>
            <Table columns={columns} dataSource={data} />
          </div>
          <FootBanner />

        </div>
      </div>
    );
  }
}

export default App;
