import Base from './base'
import Reload from './reload';
import Undo from './undo';
import Kick from './kick';
import Edit from './edit';
import Create from './create';
import Delete from './delete';

const COMMANDS: Base[] = [
  new Reload,
  new Undo,
  new Kick,
  new Edit,
  new Create,
  new Delete,
];

export default COMMANDS; 

