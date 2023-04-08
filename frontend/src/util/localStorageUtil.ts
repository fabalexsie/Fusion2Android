import { Project } from './apiService';

export function getLastOpenedProjects(): Project[] {
  const projects = localStorage.getItem('lastOpenedProjects');
  if (projects) {
    return JSON.parse(projects);
  }
  return [];
}

export function saveLastOpenedProject(project: Project) {
  const projects = getLastOpenedProjects();
  const index = projects.findIndex((p) => p.projectId === project.projectId);
  if (index !== -1) {
    projects.splice(index, 1);
  }
  projects.unshift(project);
  localStorage.setItem('lastOpenedProjects', JSON.stringify(projects));
}

export function setPasswordToLastOpenedProject(projectId: string, pw: string) {
  const project = getProjectFromLastOpenedProjects(projectId);
  if (project.projectId !== '') {
    project.pw = pw;
    saveLastOpenedProject(project);
  }
}

export function getProjectFromLastOpenedProjects(projectId: string): Project {
  const projects = getLastOpenedProjects();
  const index = projects.findIndex((p) => p.projectId === projectId);
  if (index !== -1) {
    return projects[index];
  }
  return { projectId: '', name: '' };
}
