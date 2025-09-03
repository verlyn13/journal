import { Editor } from './Editor';

export default {
  title: 'Journal/Editor',
  component: Editor,
  parameters: {
    layout: 'centered',
  },
};

export const Scaffold = () => <Editor />;
