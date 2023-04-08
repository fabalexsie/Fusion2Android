import React from 'react';
import { Dropzone } from '@mantine/dropzone';
import { Center, Group, Text, TextInput, useMantineTheme } from '@mantine/core';
import { IconLock, IconPlus, IconUpload, IconX } from '@tabler/icons-react';
import { px, rem } from '@mantine/styles';
import { notifications } from '@mantine/notifications';
import api from '../util/apiService';
import { Card } from '@mantine/core';
import {
  getProjectFromLastOpenedProjects,
  setPasswordToLastOpenedProject,
} from '../util/localStorageUtil';

export function DropZoneModel({
  projectId,
  reloadData,
}: {
  projectId: string;
  reloadData: () => void;
}) {
  const theme = useMantineTheme();
  const lastOpenedProject = getProjectFromLastOpenedProjects(projectId);
  const [loading, setLoading] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [correctPassword, setCorrectPassword] = React.useState(
    lastOpenedProject.pw || ''
  );

  const handleUpload = async (files: File[]) => {
    setLoading(true);

    for (const file of files) {
      if (file.name.endsWith('.usdz')) {
        api
          .uploadModel(projectId, file, correctPassword)
          .then(() => {
            notifications.show({
              title: 'Success',
              message: 'Erfolgreich hochgeladen und konvertiert',
              color: 'green',
            });
            setLoading(false);
            reloadData();
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
      api.checkProjPw(projectId, password).then((result) => {
        if (result) {
          setCorrectPassword(password);
          setPasswordToLastOpenedProject(projectId, password);
          notifications.show({
            title: 'Success',
            message: 'Password correct',
            color: 'green',
          });
        } else {
          notifications.show({
            title: 'Error',
            message: 'Wrong password',
            color: 'red',
          });
        }
      });
    }
  };

  const handleRemovePassword = () => {
    setCorrectPassword('');
    setPasswordToLastOpenedProject(projectId, '');
  };

  return (
    <>
      <Card padding="lg" radius="md" withBorder={correctPassword.length === 0}>
        {correctPassword.length === 0 && (
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
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              onKeyDown={handlePasswortKeyDown}
            />
          </>
        )}
        {correctPassword.length > 0 && (
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
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                cursor: 'pointer',
                color: theme.colors.gray[theme.colorScheme === 'dark' ? 4 : 6],
              }}
              onClick={handleRemovePassword}
            >
              <IconX></IconX>
            </div>
          </Card.Section>
        )}
      </Card>
    </>
  );
}
