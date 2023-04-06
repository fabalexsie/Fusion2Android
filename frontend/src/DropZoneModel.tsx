import React from 'react';
import { Dropzone } from '@mantine/dropzone';
import { Center, Group, Text, TextInput, useMantineTheme } from '@mantine/core';
import { IconLock, IconPlus, IconUpload } from '@tabler/icons-react';
import { px, rem } from '@mantine/styles';
import { notifications } from '@mantine/notifications';
import api from './apiService';
import { Card } from '@mantine/core';

export function DropZoneModel({ projectId }: { projectId: string }) {
  const theme = useMantineTheme();
  const [loading, setLoading] = React.useState(false);
  const [password, setPassword] = React.useState('');

  const handleUpload = async (files: File[]) => {
    setLoading(true);

    for (const file of files) {
      if (file.name.endsWith('.usdz')) {
        api
          .uploadModel(projectId, file)
          .then(() => {
            notifications.show({
              title: 'Success',
              message: 'Erfolgreich hochgeladen und konvertiert',
              color: 'green',
            });
            setLoading(false);
          })
          .catch((error) => {
            notifications.show({
              title: 'Error',
              message: error.message,
              color: 'red',
            });
            setLoading(false);
          });
      } else {
        setLoading(false);
        notifications.show({
          title: 'Error',
          message: 'Only .usdz files are supported',
          color: 'red',
        });
      }
    }
  };

  const handlePasswortKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      setPassword((event.target as HTMLInputElement).value);
    }
  };

  return (
    <>
      <Card padding="lg" radius="md" withBorder={password.length === 0}>
        {password.length === 0 && (
          <>
            <Center>
              <IconLock
                size={px('3.2rem')}
                stroke={1.5}
                color={
                  theme.colors[theme.primaryColor][
                    theme.colorScheme === 'dark' ? 4 : 6
                  ]
                }
              ></IconLock>
            </Center>
            <Text size="xl" inline mt="md">
              Insert password to upload files
            </Text>
            <TextInput
              label="Password"
              mt="md"
              type="password"
              onKeyDown={handlePasswortKeyDown}
            />
          </>
        )}
        {password.length > 0 && (
          <Card.Section>
            <Dropzone onDrop={(files) => handleUpload(files)} loading={loading}>
              <Group
                position="center"
                spacing="xl"
                style={{ minHeight: rem(220), pointerEvents: 'none' }}
              >
                <Dropzone.Accept>
                  <IconUpload
                    size={px('3.2rem')}
                    stroke={1.5}
                    color={
                      theme.colors[theme.primaryColor][
                        theme.colorScheme === 'dark' ? 4 : 6
                      ]
                    }
                  />
                </Dropzone.Accept>
                <Dropzone.Idle>
                  <IconPlus size={px('3.2rem')} stroke={1.5} />
                </Dropzone.Idle>

                <div>
                  <Text size="xl" inline>
                    Drag model here or click to select files
                  </Text>
                  <Text size="sm" color="dimmed" inline mt={7}>
                    File will be uploaded and converted
                  </Text>
                </div>
              </Group>
            </Dropzone>
          </Card.Section>
        )}
      </Card>
    </>
  );
}
