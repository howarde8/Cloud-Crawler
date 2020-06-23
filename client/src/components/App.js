import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Layout } from 'antd';

import Main from './Main';
import Header from './Header';
import Crawl from './Crawl';

import 'antd/dist/antd.css';
import '../styles/App.css';

function App() {
  return (
    <Router>
      <Layout style={{ backgroundColor: '#ffffff' }}>
        <Header />
        <Layout.Content>
          <Switch>
            <Route exact path="/" component={Main} />
            <Route path="/crawl" component={Crawl} />
          </Switch>
        </Layout.Content>
      </Layout>
    </Router>
  );
}

export default App;
