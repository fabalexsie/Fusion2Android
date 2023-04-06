import React from 'react';
import { Dropzone } from '@mantine/dropzone';
import { Group, Text, useMantineTheme } from '@mantine/core';
import { IconPlus, IconUpload } from '@tabler/icons-react';
import { px, rem } from '@mantine/styles';
import { notifications } from '@mantine/notifications';

export function DropZoneModel({ projectId }: { projectId: string }) {
  const theme = useMantineTheme();
  const [loading, setLoading] = React.useState(false);

  const handleUpload = async (files: File[]) => {
    setLoading(true);

    for (const file of files) {
      if (file.name.endsWith('.usdz')) {
        const formData = new FormData();
        formData.append('model', file);

        fetch(`http://localhost:3000/api/proj/${projectId}/upload`, {
          method: 'POST',
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            notifications.show({
              title: 'Success',
              message: data,
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
          });
      } else {
      }
    }
  };

  return (
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
  );
}
