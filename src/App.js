import React, { Component } from 'react';
import './App.css';
import homepage from './pic/homepage.jpg';
import logo from './pic/logo.png';

class App extends Component {
  render() {
    return (
      <div>
        <div className="topSection">
          <img className="bgpic" src={homepage} alt="homepage"/>
          <img className="logo" se={logo} alt="logo" />

          <div className="searchBar">
          
          </div>

          <div className="menuBar">
          </div>
        </div>

        <div className="midSection">
        </div>

        <div className="botSection">
        </div>

        <div className="footer">
        </div>
      </div>
    );
  }
}

export default App;
