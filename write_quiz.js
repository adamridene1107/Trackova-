const fs=require('fs')
const data=[{subject:'Maths',emoji:'x',color:'from-blue-500 to-indigo-600',themes:[]}]
fs.writeFileSync('src/lib/quizData.js','export const QUIZ_DATA = '+JSON.stringify(data)+';')
console.log('done')