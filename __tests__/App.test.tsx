import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../app/_layout';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
