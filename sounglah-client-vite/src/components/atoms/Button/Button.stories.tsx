import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import AppButton from './Button';

export const ActionsData = {
  onClick: fn(),
};

const meta = {
  component: AppButton,
  title: 'Atoms/Button',
  tags: ['autodocs'],
  excludeStories: /.*Data$/,
  args: {
    ...ActionsData,
  },
} satisfies Meta<typeof AppButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant:'primary',
    children: "Translate"
  },
};

export const Secondary: Story = {
  args: {
    variant:'secondary',
    children: "Translate"
  },
};

export const Disabled: Story = {
  args: {
    children: "Translate",
    disabled: true
  },
};
