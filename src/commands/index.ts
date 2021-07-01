import Base from './base'
import Reload from './reload';
import Undo from './undo';
import Kick from './kick';
import Set from './set';
import Create from './create';
import Delete from './delete';
import Restore from './restore';
import Give from './give';
import Take from './take';

const COMMANDS: Base[] = [
  new Reload,
  new Undo,
  new Kick,
  new Set,
  new Create,
  new Delete,
  new Restore,
  new Give,
  new Take,
];

export default COMMANDS; 

