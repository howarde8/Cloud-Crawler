import React, { useState } from 'react';
import { withApollo } from 'react-apollo';
import { gql } from 'apollo-boost';
import { Layout, Menu, Input, Row, Col, Divider } from 'antd';

const DESCRIPTION = gql`
  {
    description
  }
`;

const CRAWL = gql`
  query Crawl($xpath: String!) {
    crawl(xpath: $xpath)
  }
`;

function Main({ client }) {
  const [crawlResult, setCrawlResult] = useState(null);

  const onSearch = (value) => {
    console.log(value);
    client.query({ query: CRAWL, variables: { xpath: value } }).then(({ data: { crawl } }) => setCrawlResult(crawl));
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
        </Layout.Content>
      </Layout.Header>
    </Layout>
  );
}

export default withApollo(Main);
