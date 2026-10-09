import React from 'react';
import { AccessibilityInfo, Text } from 'react-native';
import { act, create } from 'react-test-renderer';

import {
  InkWriteText,
  resetInkWriteForTests,
} from '../src/components/InkWriteText';
import { ThemeProvider } from '../src/theme';

describe('InkWriteText (character reveal — not stroke handwriting)', () => {
  afterEach(() => {
    resetInkWriteForTests();
  });

  it('renders the full phrase immediately when reduce motion is enabled', async () => {
    jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(true);
    let tree: ReturnType<typeof create> | undefined;
    await act(async () => {
      tree = create(
        <ThemeProvider>
          <InkWriteText playKey="test-hi" text="Hi, Ada" variant="display" />
        </ThemeProvider>,
      );
      await Promise.resolve();
      await Promise.resolve();
    });
    const label = tree!.root.findByProps({ accessibilityLabel: 'Hi, Ada' });
    expect(label).toBeTruthy();
    await act(async () => {
      tree!.unmount();
    });
  });

  it('reveals characters once on first appearance when motion is allowed', async () => {
    jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(false);
    let tree: ReturnType<typeof create> | undefined;
    await act(async () => {
      tree = create(
        <ThemeProvider>
          <InkWriteText playKey="test-write" text="Hi" variant="display" />
        </ThemeProvider>,
      );
      await Promise.resolve();
      await Promise.resolve();
    });
    const label = tree!.root.findByProps({ accessibilityLabel: 'Hi' });
    expect(label).toBeTruthy();
    expect(label.findAllByType(Text).length).toBe(2);
    await act(async () => {
      tree!.unmount();
    });
  });
});
