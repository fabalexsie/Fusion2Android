import { Params, useLoaderData } from 'react-router-dom';
import api, { Model } from './apiService';
import {
  Button,
  Card,
  CardSection,
  Container,
  Image,
  SimpleGrid,
  Text,
} from '@mantine/core';
import { DropZoneModel } from './DropZoneModel';

export async function loader({ params }: { params: Params<string> }) {
  if (params.projectId !== undefined) {
    const models = await api.getModels(params.projectId);
    return { projectId: params.projectId, models };
  } else {
    return { models: [] };
  }
}

export function ProjectPage() {
  const { projectId, models } = useLoaderData() as {
    projectId: string;
    models: Model[];
  };

  return (
    <Container>
      <>
        <h1>Project {models.length}</h1>
        <SimpleGrid cols={3}>
          {models.map((model) => (
            <Card
              key={model.name}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
            >
              <CardSection>
                <Image src={model.cover} alt={model.name} height={300} />
              </CardSection>
              <Text mt="md">{model.name}</Text>
              <Button
                variant="light"
                color="blue"
                fullWidth
                mt="md"
                radius="md"
              >
                Open Model in 3D Viewer
              </Button>
            </Card>
          ))}
          <DropZoneModel projectId={projectId} />
        </SimpleGrid>
      </>
    </Container>
  );
}
