export interface Area {
  _id: string;
  _type: 'area';
  title?: string;
  description?: string;
  button?: {
    text: string;
    url: string;
  };
}