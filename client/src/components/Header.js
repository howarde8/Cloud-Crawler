import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';

export default function () {
  return (
    <Layout.Header style={{ backgroundColor: '#ffffff' }}>
      <Link to="/">
        <div style={{ float: 'left', fontSize: '18px', marginRight: '20px' }}>Cloud Crawler</div>
      </Link>
      <Menu mode="horizontal">
        <Menu.Item key="records">Records</Menu.Item>
        <Menu.Item key="settings">Settings</Menu.Item>
      </Menu>
    </Layout.Header>
  );
}
