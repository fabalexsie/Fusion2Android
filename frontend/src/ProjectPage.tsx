import { Params, useLoaderData } from 'react-router-dom';
import api, { Model } from './apiService';
import {
  Button,
  Card,
  CardSection,
  Container,
  SimpleGrid,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { DropZoneModel } from './DropZoneModel';
import { GLTFViewer } from './GLTFViewer';

export async function loader({ params }: { params: Params<string> }) {
  if (params.projectId !== undefined) {
    try {
      const models = await api.getModels(params.projectId);
      return { projectId: params.projectId, models };
    } catch (e) {
      return { projectId: params.projectId, models: [] };
    }
  } else {
    return { models: [] };
  }
}

export function ProjectPage() {
  const theme = useMantineTheme();

  const { projectId, models } = useLoaderData() as {
    projectId: string;
    models: Model[];
  };

  return (
    <Container>
      <>
        <Title order={1} mb="md">
          Project {models.length}
        </Title>
        <SimpleGrid
          cols={3}
          breakpoints={[
            { maxWidth: theme.breakpoints.md, cols: 2 },
            { maxWidth: theme.breakpoints.sm, cols: 1 },
          ]}
        >
          {models.map((model) => (
            <Card
              key={model.name}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
            >
              <CardSection>
                <GLTFViewer modelLink={model.link} height={150} />
              </CardSection>
              <Text mt="md">{model.name}</Text>
              {model.link ? (
                <Button
                  href={`intent://arvr.google.com/scene-viewer/1.0?file=${window.location.origin}${model.link}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;`}
                  component="a"
                  variant="light"
                  color="blue"
                  fullWidth
                  mt="md"
                  radius="md"
                >
                  Open Model in 3D Viewer
                </Button>
              ) : (
                <Button
                  disabled
                  variant="light"
                  color="blue"
                  fullWidth
                  mt="md"
                  radius="md"
                >
                  Open Model in 3D Viewer
                </Button>
              )}
            </Card>
          ))}
          <DropZoneModel projectId={projectId} />
        </SimpleGrid>
      </>
    </Container>
  );
}
