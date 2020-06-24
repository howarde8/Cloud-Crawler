import React from 'react';
import { withApollo, Query } from 'react-apollo';
import { useHistory } from 'react-router-dom';
import { gql } from 'apollo-boost';
import { Input, Row, Col, Divider, Card, Form, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const CRAWL_SUBSCRIPTION = gql`
  subscription onCrawlUpdated {
    crawlUpdated {
      id
      status
    }
  }
`;

const CRAWLS = gql`
  query {
    crawls {
      id
      name
      url
      xpath
      status
      result
    }
  }
`;

const ADD_CRAWL = gql`
  mutation AddCrawl($url: String!, $xpath: String!) {
    addCrawl(url: $url, xpath: $xpath) {
      id
      name
      url
      xpath
      status
      result
    }
  }
`;

export default withApollo(function ({ client }) {
  const history = useHistory();

  const onSearch = async (values) => {
    console.log(values);
    await client.mutate({
      mutation: ADD_CRAWL,
      variables: values,
      update: (cache, { data: { addCrawl: crawl } }) => {
        const { crawls } = cache.readQuery({ query: CRAWLS });
        console.log(crawls);
        cache.writeQuery({ query: CRAWLS, data: { crawls: [...crawls, crawl] } });
      },
    });
  };

  return (
    <>
      <Row justify="center">
        <Col xs={24} lg={16} xl={12}>
          <Form onFinish={onSearch} style={{ margin: '50px 10px 10px 10px' }}>
            <Form.Item name="url" noStyle>
              <Input placeholder="URL" style={{ width: '45%', marginRight: 3 }}></Input>
            </Form.Item>
            <Form.Item name="xpath" noStyle>
              <Input placeholder="XPath" style={{ width: '45%', marginRight: 3 }}></Input>
            </Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '8%' }}>
              <SearchOutlined />
            </Button>
          </Form>
        </Col>
      </Row>
      <Row justify="center">
        <Divider />
        <Col xs={24} lg={16} xl={12}>
          <Row gutter={8}>
            <Query query={CRAWLS}>
              {({ subscribeToMore, loading, error, data }) => {
                subscribeToMore({
                  document: CRAWL_SUBSCRIPTION,
                  updateQuery: (prev, { subscriptionData }) => {
                    if (!subscriptionData) return prev;
                    return subscriptionData;
                  },
                });
                if (loading) return 'Loading...';
                if (error) return 'Error';
                return data.crawls.map((crawl) => (
                  <Col span={8} key={crawl.id}>
                    <Card
                      hoverable
                      size="small"
                      title={crawl.id}
                      onClick={() => {
                        history.push(`/crawl/${crawl.id}`);
                      }}
                      style={{ marginBottom: 8 }}
                    >
                      <p>URL: {crawl.url}</p>
                      <p>XPath: {crawl.xpath}</p>
                      <p>Status: {crawl.status}</p>
                    </Card>
                  </Col>
                ));
              }}
            </Query>
          </Row>
        </Col>
      </Row>
    </>
  );
});
