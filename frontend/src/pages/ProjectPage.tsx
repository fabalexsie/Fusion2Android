import { Params, useFetcher, useLoaderData } from 'react-router-dom';
import api, { Model, ProjectInfo } from '../util/apiService';
import {
  Button,
  Card,
  CardSection,
  Container,
  Input,
  SimpleGrid,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { DropZoneModel } from '../components/DropZoneModel';
import { GLTFViewer } from '../components/GLTFViewer';
import { saveLastOpenedProject } from '../util/localStorageUtil';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconEdit } from '@tabler/icons-react';
import { useState } from 'react';

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

export async function action({
  params,
  request,
}: {
  params: Params<string>;
  request: Request;
}) {
  const formData = await request.formData();
  await api.updateProjectInfo(JSON.parse(formData.get('body') as string));
  return { success: true };
}

export function ProjectPage() {
  const theme = useMantineTheme();
  const { projectInfo, models } = useLoaderData() as {
    projectInfo: ProjectInfo;
    models: Model[];
  };

  const [projectInfoEditable, setProjectInfoEditable] = useState(false);
  const [editedProjectName, setEditedProjectName] = useState(projectInfo.name);
  const fetcher = useFetcher();

  const handleProjectNameSave = async () => {
    try {
      fetcher.submit(
        {
          body: JSON.stringify({
            ...projectInfo,
            name: editedProjectName,
          }),
        },
        { method: 'POST', action: `/${projectInfo.projectId}` }
      );
      setProjectInfoEditable(false);
    } catch (e) {
      notifications.show({
        title: 'Error',
        message: 'Could not update project name',
        color: 'red',
      });
    }
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
          <Title
            order={1}
            mb="md"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            Project{' '}
            {projectInfoEditable ? (
              <>
                <Input
                  style={{
                    display: 'flex',
                    flexGrow: 1,
                  }}
                  mx="md"
                  value={editedProjectName}
                  onChange={(ev) => {
                    setEditedProjectName(ev.currentTarget.value);
                  }}
                />
                <IconCheck onClick={handleProjectNameSave} />
              </>
            ) : (
              <>
                <Text span mx="md">
                  {projectInfo.name}
                </Text>
                <IconEdit onClick={() => setProjectInfoEditable((b) => !b)} />
              </>
            )}
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
