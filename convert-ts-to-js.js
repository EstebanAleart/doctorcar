const fs = require('fs');
const path = require('path');

function convertTsToJs(content) {
  let lines = content.split('\n');
  let result = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Remover import type
    line = line.replace(/import\s+type\s+\{([^}]+)\}\s+from/, 'import {$1} from');
    line = line.replace(/import\s+type\s+(\w+)\s+from/, 'import $1 from');
    
    // Remover anotaciones de tipo en parámetros: param: Type
    line = line.replace(/(\w+)\s*:\s*[A-Z][\w<>[\]|&\s]*(?=[,\)])/g, '$1');
    
    // Remover tipos de retorno de funciones: ): Type =>
    line = line.replace(/\)\s*:\s*[A-Z][\w<>[\]|&\s]*\s*=>/g, ') =>');
    
    // Remover tipos en useState y otros hooks
    line = line.replace(/useState<([^>]+)>/g, 'useState');
    line = line.replace(/React\.useState<([^>]+)>/g, 'React.useState');
    
    // Remover tipo en variables: const x: Type =
    line = line.replace(/:\s*[A-Z][\w<>[\]|&\s]*\s*=/g, ' =');
    
    // Remover React.FC y similares
    line = line.replace(/:\s*React\.(FC|ReactNode|ReactElement)(<[^>]*>)?/g, '');
    
    // Remover "as Type"
    line = line.replace(/\s+as\s+[A-Z][\w<>[\]|&\s]*/g, '');
    
    // Remover "as const"
    line = line.replace(/\s+as\s+const\b/g, '');
    
    // Remover genéricos en tipos
    line = line.replace(/<[A-Z][\w<>[\]|&\s,]*>/g, '');
    
    // Remover ? opcional de parámetros
    line = line.replace(/(\w+)\?\s*:/g, '$1:');
    line = line.replace(/(\w+)\?\s*,/g, '$1,');
    
    // Remover interface y type declarations
    if (line.trim().startsWith('interface ') || line.trim().startsWith('type ')) {
      // Skip hasta encontrar el final
      let braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      if (braceCount === 0) continue;
      
      while (braceCount > 0 && i < lines.length - 1) {
        i++;
        braceCount += (lines[i].match(/\{/g) || []).length;
        braceCount -= (lines[i].match(/\}/g) || []).length;
      }
      continue;
    }
    
    result.push(line);
  }
  
  return result.join('\n');
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const converted = convertTsToJs(content);
    
    // Cambiar extensión
    const newPath = filePath.replace(/\.tsx?$/, filePath.endsWith('.tsx') ? '.jsx' : '.js');
    
    fs.writeFileSync(newPath, converted, 'utf8');
    
    // Si es diferente el nombre, borrar el original
    if (newPath !== filePath) {
      fs.unlinkSync(filePath);
    }
    
    console.log(`✓ ${path.basename(filePath)} -> ${path.basename(newPath)}`);
    return true;
  } catch (error) {
    console.error(`✗ ${path.basename(filePath)}: ${error.message}`);
    return false;
  }
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  let stats = { success: 0, error: 0, skipped: 0 };
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (item === 'node_modules' || item.startsWith('.')) {
        continue;
      }
      const subStats = processDirectory(fullPath);
      stats.success += subStats.success;
      stats.error += subStats.error;
      stats.skipped += subStats.skipped;
    } else if (item.match(/\.(ts|tsx)$/) && !item.endsWith('.d.ts')) {
      if (processFile(fullPath)) {
        stats.success++;
      } else {
        stats.error++;
      }
    }
  }
  
  return stats;
}

console.log('Convirtiendo archivos TypeScript a JavaScript...\n');
const stats = processDirectory(__dirname);
console.log(`\n✅ ${stats.success} archivos convertidos`);
console.log(`❌ ${stats.error} archivos con errores`);
console.log(`⊘  ${stats.skipped} archivos omitidos`);
