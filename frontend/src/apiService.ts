export type Model = {
  name: string;
  cover: string;
  link: string;
};

function getModels(projectId: string): Promise<Model[]> {
  return fetch(`/api/proj/${projectId}/models`).then((res) => res.json());
}

function uploadModel(projectId: string, file: File): Promise<boolean> {
  const formData = new FormData();
  formData.append('model', file);

  return fetch(`/api/proj/${projectId}/upload`, {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      return true;
    });
}

const exported = {
  getModels,
  uploadModel,
};
export default exported;
