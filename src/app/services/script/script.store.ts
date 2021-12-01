

import { environment } from '../../../environments/environment';

interface Scripts {
  name: string;
  src: string;
} 

// export const ScriptStore: Scripts[] = [
//   {name: 'filepicker', src: 'https://api.filestackapi.com/filestack.js'},
//   {name: 'rangeSlider', src: '../../../assets/js/ion.rangeSlider.min.js'}
// ];



export function ScriptStoreT(): string { 

  // console.log('SCRIPT STORE - ENV ', environment)

  return
}

// export const ScriptStore: Scripts[] = [
//   {name: 'td_custom', src: 'https://tiledeskcustomscript.nicolan74.repl.co/script.js'}
// ];

export const ScriptStore: Scripts[] = [
  {name: 'dummy', src: '../../../assets/dummy_script.js'}
];

