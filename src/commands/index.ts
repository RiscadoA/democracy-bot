import Base from './base'
import Reload from './reload';
import Undo from './undo';
import Kick from './kick';
import Edit from './edit';
import Create from './create';
import Delete from './delete';
import Give from './give';
import Take from './take';

const COMMANDS: Base[] = [
  new Reload,
  new Undo,
  new Kick,
  new Edit,
  new Create,
  new Delete,
  new Give,
  new Take,
];

export default COMMANDS; 

