import React from 'react';
import { Query } from 'react-apollo';
import { gql } from 'apollo-boost';
import { useHistory } from 'react-router-dom';
import { Descriptions, Table, Divider } from 'antd';

const CRAWL = gql`
  query Crawl($id: ID!) {
    crawl(id: $id) {
      id
      name
      url
      xpath
      status
      result
    }
  }
`;

export default function () {
  const history = useHistory();
  const crawlId = history.location.pathname.split('/').pop();

  return (
    <div style={{ margin: 20 }}>
      <Query query={CRAWL} variables={{ id: crawlId }}>
        {({ loading, error, data }) => {
          if (loading) return 'Loading...';
          if (error) return 'Error';
          let result = data.crawl.result;
          if (!result) result = [];
          else result = JSON.parse(result);

          return (
            <>
              <Descriptions title="Crawl information" bordered>
                <Descriptions.Item label="ID">{data.crawl.id}</Descriptions.Item>
                <Descriptions.Item label="Status">{data.crawl.status}</Descriptions.Item>
                <Descriptions.Item label="URL">{data.crawl.url}</Descriptions.Item>
                <Descriptions.Item label="XPath">{data.crawl.xpath}</Descriptions.Item>
              </Descriptions>
              <Divider />
              <Table
                columns={[
                  { title: 'Order', key: 'order', dataIndex: 'order' },
                  { title: 'Result', key: 'line', dataIndex: 'line' },
                ]}
                dataSource={result.map((e, i) => ({ key: i, order: i, line: e }))}
              />
            </>
          );
        }}
      </Query>
    </div>
  );
}
