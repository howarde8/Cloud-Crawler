import React, { useState } from 'react';
import { withApollo, Subscription } from 'react-apollo';
import { gql } from 'apollo-boost';
import { Layout, Menu, Input, Row, Col, Divider } from 'antd';

const CRAWL_SUBSCRIPTION = gql`
  subscription onCrawlAdded {
    crawlAdded {
      id
      status
      result
    }
  }
`;

const CRAWL = gql`
  mutation Crawl($url: String!, $xpath: String!) {
    crawl(url: $url, xpath: $xpath) {
      id
      status
      result
    }
  }
`;

function Main({ client }) {
  const [crawlResult, setCrawlResult] = useState(null);

  const onSearch = (value) => {
    console.log(value);
    client
      .mutate({ mutation: CRAWL, variables: { url: 'TODO', xpath: value } })
      .then(({ data: { crawl } }) => setCrawlResult(JSON.stringify(crawl)));
  };

  return (
    <Layout>
      <Layout.Header style={{ backgroundColor: '#ffffff' }}>
        <div style={{ float: 'left', fontSize: '18px', marginRight: '20px' }}>Cloud Crawler</div>
        <Menu mode="horizontal">
          <Menu.Item key="records">Records</Menu.Item>
          <Menu.Item key="settings">Settings</Menu.Item>
        </Menu>
        <Layout.Content>
          <Row justify="center">
            <Col xs={24} lg={16} xl={12}>
              <Input.Search
                placeholder="XPath"
                enterButton="Crawl"
                onSearch={onSearch}
                style={{ margin: '50px 10px 10px 10px' }}
              ></Input.Search>
            </Col>
          </Row>
          <Row justify="center">
            <Divider />
            <Col xs={24} lg={16} xl={12}>
              {crawlResult}
            </Col>
          </Row>
          <Row justify="center">
            <Divider />
            <p>Test</p>
            <Col xs={24} lg={16} xl={12}>
              <Subscription subscription={CRAWL_SUBSCRIPTION}>
                {({ data, loading }) => {
                  if (loading) return <p>Loading...</p>;
                  return <p>data: {JSON.stringify(data)}</p>;
                }}
              </Subscription>
            </Col>
          </Row>
        </Layout.Content>
      </Layout.Header>
    </Layout>
  );
}

export default withApollo(Main);
