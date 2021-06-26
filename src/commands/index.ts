import Base from './base'
import Reload from './reload';
import Kick from './kick';

const COMMANDS: Base[] = [
  new Reload,
  new Kick,
];

export default COMMANDS; 

