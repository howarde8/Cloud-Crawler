import React from 'react';
import { Query } from 'react-apollo';
import { gql } from 'apollo-boost';

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
  return (
    <div>
      <h1>Crawl</h1>
      <Query query={CRAWL} variables={{ id: 0 }}>
        {({ loading, error, data }) => {
          if (loading) return 'Loading...';
          if (error) return 'Error';
          return (
            <>
              <p>ID: {data.crawl.id}</p>
              <p>URL: {data.crawl.url}</p>
              <p>XPath: {data.crawl.xpath}</p>
              <p>Status: {data.crawl.status}</p>
              <p>Result:</p>
              {data.crawl.result.map((e) => (
                <p>{e}</p>
              ))}
            </>
          );
        }}
      </Query>
    </div>
  );
}
