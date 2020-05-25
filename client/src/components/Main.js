import React from 'react';
import { Layout, Menu, Input, Row, Col } from 'antd';

function Main() {
  const onSearch = (value) => {
    console.log(value);
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
                style={{ margin: '10px' }}
              ></Input.Search>
            </Col>
          </Row>
        </Layout.Content>
      </Layout.Header>
    </Layout>
  );
}

export default Main;
