import React from 'react';
import { Layout, Menu } from 'antd';

export default function () {
  return (
    <Layout.Header style={{ backgroundColor: '#ffffff' }}>
      <div style={{ float: 'left', fontSize: '18px', marginRight: '20px' }}>Cloud Crawler</div>
      <Menu mode="horizontal">
        <Menu.Item key="records">Records</Menu.Item>
        <Menu.Item key="settings">Settings</Menu.Item>
      </Menu>
    </Layout.Header>
  );
}
