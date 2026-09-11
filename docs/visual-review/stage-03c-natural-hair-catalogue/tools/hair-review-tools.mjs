export function silhouetteKey(id,bounds){return `${id}:${bounds.join(",")}`;}
export function boardOrder(items){return [...items].sort((a,b)=>a.id.localeCompare(b.id));}
