export type Model = {
  name: string;
  cover: string;
  link: string;
};

function getModels(projectId: string): Promise<Model[]> {
  return fetch(`/api/proj/${projectId}/models`).then((res) => res.json());
}

const exported = {
  getModels,
};
export default exported;
