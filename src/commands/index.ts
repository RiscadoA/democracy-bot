import Base from './base'
import Reload from './reload';
import Kick from './kick';
import Edit from './edit';

const COMMANDS: Base[] = [
  new Reload,
  new Kick,
  new Edit,
];

export default COMMANDS; 

