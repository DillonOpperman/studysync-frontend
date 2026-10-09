import React from 'react';
import { AccessibilityInfo, Text } from 'react-native';
import { act, create } from 'react-test-renderer';

import {
  InkWriteText,
  resetInkWriteForTests,
} from '../src/components/InkWriteText';
import { canWriteInInk, layoutInk } from '../src/components/ink/glyphs';
import { ThemeProvider } from '../src/theme';

describe('InkWriteText (stroke-based bookhand, not a character pop)', () => {
  afterEach(() => {
    resetInkWriteForTests();
  });

  it('lays out dynamic names as sequential SVG strokes', () => {
    expect(canWriteInInk('Hi, Ada')).toBe(true);
    expect(canWriteInInk('Hi, Dillon')).toBe(true);
    const ada = layoutInk('Hi, Ada');
    const dillon = layoutInk('Hi, Dillon');
    expect(ada.strokes.length).toBeGreaterThan(4);
    expect(dillon.strokes.length).toBeGreaterThan(ada.strokes.length);
    expect(dillon.width).toBeGreaterThan(ada.width);
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
    expect(label.findAllByType(Text).length).toBe(1);
    await act(async () => {
      tree!.unmount();
    });
  });

  it('keeps an accessible label while strokes are drawing', async () => {
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
    await act(async () => {
      tree!.unmount();
    });
  });
});
