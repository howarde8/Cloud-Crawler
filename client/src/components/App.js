import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Main from './Main';
import Crawl from './Crawl';
import 'antd/dist/antd.css';
import '../styles/App.css';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Main} />
        <Route path="/crawl" component={Crawl} />
      </Switch>
    </Router>
  );
}

export default App;
