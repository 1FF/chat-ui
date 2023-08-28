import React from 'react';
import { render } from '@testing-library/react';
import Chatbot from '../../src/Chatbot';

test('renders Chatbot', () => {
  const { getByText } = render(<Chatbot />);
  const componentElement = getByText(/Your component text/i);
  expect(componentElement).toBeInTheDocument();
});