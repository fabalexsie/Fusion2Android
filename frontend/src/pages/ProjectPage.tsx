import { Params, useLoaderData } from 'react-router-dom';
import api, { Model, ProjectInfo } from '../util/apiService';
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
import { DropZoneModel } from '../components/DropZoneModel';
import { GLTFViewer } from '../components/GLTFViewer';
import { saveLastOpenedProject } from '../util/localStorageUtil';
import { notifications } from '@mantine/notifications';

export async function loader({ params }: { params: Params<string> }) {
  if (params.projectId !== undefined) {
    let projectInfo: ProjectInfo | undefined;
    try {
      projectInfo = await api.getProjectInfo(params.projectId);
      if (projectInfo && projectInfo.projectId) {
        saveLastOpenedProject(projectInfo);
      }
    } catch (e) {
      notifications.show({
        title: 'Error',
        message: 'Could not load project info',
        color: 'red',
      });
    }

    let models: Model[] = [];
    try {
      models = await api.getModels(params.projectId);
    } catch (e) {
      notifications.show({
        title: 'Error',
        message: 'Could not load models',
        color: 'red',
      });
    }

    return { projectInfo, models };
  } else {
    return { projectInfo: null, models: [] };
  }
}

export function ProjectPage() {
  const theme = useMantineTheme();

  const { projectInfo, models } = useLoaderData() as {
    projectInfo: ProjectInfo;
    models: Model[];
  };

  if (!projectInfo || !projectInfo.projectId) {
    return (
      <Container>
        <Title order={1} mb="md">
          Project not found
        </Title>
      </Container>
    );
  } else {
    return (
      <Container>
        <>
          <Title order={1} mb="md">
            Project {projectInfo.name}
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
            <DropZoneModel projectId={projectInfo.projectId} />
          </SimpleGrid>
        </>
      </Container>
    );
  }
}