import Base from './base'
import Reload from './reload';
import Undo from './undo';
import Kick from './kick';
import Edit from './edit';

const COMMANDS: Base[] = [
  new Reload,
  new Undo,
  new Kick,
  new Edit,
];

export default COMMANDS; 

