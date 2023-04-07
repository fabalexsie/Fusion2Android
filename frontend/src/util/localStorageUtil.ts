import { ProjectInfo } from './apiService';

export function getLastOpenedProjects(): ProjectInfo[] {
  const projects = localStorage.getItem('lastOpenedProjects');
  if (projects) {
    return JSON.parse(projects);
  }
  return [];
}

export function saveLastOpenedProject(project: ProjectInfo) {
  const projects = getLastOpenedProjects();
  const index = projects.findIndex((p) => p.projectId === project.projectId);
  if (index !== -1) {
    projects.splice(index, 1);
  }
  projects.unshift(project);
  localStorage.setItem('lastOpenedProjects', JSON.stringify(projects));
}
