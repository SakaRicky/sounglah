
import type { Preview } from '@storybook/react';

 import '../src/index.scss';
 import { MantineProvider } from "@mantine/core";
import { theme } from "../src/theme";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <MantineProvider
        theme={theme}
      >
        <Story />
      </MantineProvider>
    ),
  ],
};

export default preview;