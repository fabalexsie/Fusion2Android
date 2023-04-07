export type Model = {
  name: string;
  cover: string;
  link: string;
};

export type ProjectInfo = {
  projectId: string;
  name: string;
};

function getModels(projectId: string): Promise<Model[]> {
  return fetch(`/api/proj/${projectId}/models`).then((res) => res.json());
}

function uploadModel(
  projectId: string,
  file: File,
  password: string
): Promise<boolean> {
  const formData = new FormData();
  formData.append('model', file);

  const params = new URLSearchParams();
  params.append('pw', password);

  return fetch(`/api/proj/${projectId}/upload?${params}`, {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      return true;
    });
}

function checkProjPw(projectId: string, pw: string): Promise<boolean> {
  return fetch(`/api/proj/${projectId}/checkPw?pw=${pw}`)
    .then((response) => response.json())
    .then((data) => {
      return data.success;
    });
}

function getProjectInfo(projectId: string): Promise<ProjectInfo> {
  return fetch(`/api/proj/${projectId}/info`).then((res) => res.json());
}

const exported = {
  getModels,
  uploadModel,
  checkProjPw,
  getProjectInfo,
};
export default exported;