import {
  ActionIcon,
  Alert,
  Anchor,
  Button,
  Container,
  CopyButton,
  PasswordInput,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useState } from 'react';
import api, { Project } from '../util/apiService';
import { IconAlertCircle, IconCheck, IconCopy } from '@tabler/icons-react';

export function NewProject() {
  const theme = useMantineTheme();

  const [adminPassword, setAdminPassword] = useState('');
  const [project, setProject] = useState<Project | null>(null);

  const handleCreateProject = () => {
    api.createProject(adminPassword).then((project: Project) => {
      setProject(project);
    });
  };

  return (
    <Container>
      <Title order={1}>Create New Project</Title>
      {!project ? (
        <>
          <Text mt="md">
            To protect this instance from spamming, an admin password is
            required to create a new project.
          </Text>
          <PasswordInput
            mt="md"
            label="Admin Password"
            value={adminPassword}
            onChange={(ev) => {
              setAdminPassword(ev.currentTarget.value);
            }}
          />
          <Button mt="md" onClick={handleCreateProject}>
            Create
          </Button>
        </>
      ) : (
        <>
          <Text mt="md">
            Project created successfully. You can now share the following link
            with your collaborators:
          </Text>
          <Text mt="md" size="xl">
            <Anchor href={`/${project.projectId}`}>
              {window.location.origin}/{project.projectId}
            </Anchor>
          </Text>
          <Text mt="md">
            To upload models, you must use the following password:
          </Text>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: theme.spacing.md,
            }}
          >
            <Text span size="xl" c="dimmed">
              Passwort:
            </Text>
            <Text span size="xl" mx="xs">
              {project.pw}
            </Text>
            <div style={{ display: 'inline-block' }}>
              <CopyButton value={project.pw || ''}>
                {({ copied, copy }) => (
                  <ActionIcon
                    variant="subtle"
                    onClick={copy}
                    color={copied ? 'teal' : 'blue'}
                  >
                    {copied ? <IconCheck /> : <IconCopy />}
                  </ActionIcon>
                )}
              </CopyButton>
            </div>
          </div>
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Attention!"
            color="red"
          >
            <Text>
              The password is only displayed once. If you lose it, you cannot
              recover it. Please make sure to save it in a safe place.
            </Text>
            <Text>
              Without the password, you cannot upload new models to the project.
            </Text>
          </Alert>
        </>
      )}
    </Container>
  );
}
