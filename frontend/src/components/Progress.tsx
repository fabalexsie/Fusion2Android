import { Center, Paper, RingProgress, Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export function Progress({
  progress,
  onFinishedFadeOutMS,
}: {
  progress: number;
  onFinishedFadeOutMS: number | undefined;
}) {
  const [visibility, setVisibility] = useState<'visible' | 'hidden'>('visible');
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (onFinishedFadeOutMS !== undefined) {
      if (progress >= 100) {
        setOpacity(0);
        setTimeout(() => {
          setVisibility('hidden');
        }, onFinishedFadeOutMS);
      } else {
        setVisibility('visible');
        setOpacity(1);
      }
    }
  }, [progress, onFinishedFadeOutMS]);

  return (
    <div
      style={{
        visibility: visibility,
        opacity: opacity,
        transition: `opacity ${onFinishedFadeOutMS}ms`,
      }}
    >
      {progress < 0 && (
        <Paper radius="50%" bg="red.0" p={0}>
          <RingProgress
            roundCaps
            sections={[{ value: progress, color: 'red' }]}
            label={
              <Center>
                <ThemeIcon color="red" variant="light" radius="xl" size="xl">
                  <IconX size={22} />
                </ThemeIcon>
              </Center>
            }
          />
        </Paper>
      )}
      {0 <= progress && progress < 100 && (
        <Paper radius="50%" bg="blue.0" p={0}>
          <RingProgress
            rootColor="gray.5"
            sections={[{ value: progress, color: 'blue' }]}
            label={
              <Text color="blue" weight={700} align="center" size="xl">
                {Math.round(progress * 10) / 10}%
              </Text>
            }
          />
        </Paper>
      )}
      {100 <= progress && (
        <Paper radius="50%" bg="teal.0" p={0}>
          <RingProgress
            sections={[{ value: 100, color: 'teal' }]}
            label={
              <Center>
                <ThemeIcon color="teal" variant="light" radius="xl" size="xl">
                  <IconCheck size={22} />
                </ThemeIcon>
              </Center>
            }
          />
        </Paper>
      )}
    </div>
  );
}
