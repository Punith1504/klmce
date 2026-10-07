'use strict';
// Validate only child edges. Parent/prev edges in upstream ASTs intentionally cycle.
module.exports = ast => {
  const queue=[[ast,0]],seen=new WeakSet();
  let nodes=0;
  while(queue.length){
    const [node,depth]=queue.pop();
    if(!node || typeof node!=='object')continue;
    if(depth>128 || seen.has(node) || ++nodes>10000){
      const error=new SyntaxError('Brace AST exceeds safe depth or node budget');
      error.code='ERR_BRACES_DEPTH'; throw error;
    }
    seen.add(node);
    if(Array.isArray(node.nodes))for(const child of node.nodes)queue.push([child,depth+1]);
  }
};
