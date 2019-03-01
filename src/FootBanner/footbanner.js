import React,{Component} from 'react';
import './footbanner.css';

export default class FootBanner extends Component {
  render() {
    return(
      <div className="footerContainer">
        <div className="footerMain">
          <ul>
            <li className="footerSection">
                <h4>这里放一个title</h4>
                <ul>
                  <li><a className="footLink" href="#">这里放一个链接</a></li>
                  <li><a className="footLink" href="#">这里放一个链接</a></li>
                  <li><a className="footLink" href="#">这里放一个链接</a></li>
                </ul>
            </li>
          </ul>
          <ul>
            <li className="footerSection">
                <h4>这里放一个title</h4>
                <ul>
                  <li><a className="footLink" href="#">这里放一个链接</a></li>
                  <li><a className="footLink" href="#">这里放一个链接</a></li>
                  <li><a className="footLink" href="#">这里放一个链接</a></li>
                </ul>
            </li>
          </ul>
          <ul>
            <li className="footerSection">
                <h4>这里放一个title</h4>
                <ul>
                  <li><a className="footLink" href="#">这里放一个链接</a></li>
                  <li><a className="footLink" href="#">这里放一个链接</a></li>
                  <li><a className="footLink" href="#">这里放一个链接</a></li>
                </ul>
            </li>
          </ul>
        </div>
      </div>
    )
  }
}
