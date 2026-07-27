const fs = require('fs');
const path = 'app/(tabs)/vault.tsx';
let content = fs.readFileSync(path, 'utf8');
let changes = 0;

const importRegex = /^import .+;\s*$/gm;
let match, lastImportEnd = -1;
while ((match = importRegex.exec(content)) !== null) {
  lastImportEnd = match.index + match[0].length;
}
if (lastImportEnd !== -1) {
  const newImports =
    "\nimport { useVaultAction } from '../../src/hooks/useVaultAction';" +
    "\nimport { VaultActionProgress } from '../../src/components/VaultActionProgress';";
  content = content.slice(0, lastImportEnd) + newImports + content.slice(lastImportEnd);
  changes++;
  console.log('Imports added');
} else {
  console.log('Could not find import section');
}

const handleActionAnchor =
  "const handleAction = async (action: 'deposit' | 'withdraw' | 'lock') => {";
if (content.includes(handleActionAnchor)) {
  content = content.replace(
    handleActionAnchor,
    'const vaultAction = useVaultAction();\n\n  ' + handleActionAnchor
  );
  changes++;
  console.log('Hook instance added');
} else {
  console.log('Could not find handleAction anchor');
}

const jsxAnchor = '<View style={styles.form}>\n\n          <Input';
if (content.includes(jsxAnchor)) {
  content = content.replace(
    jsxAnchor,
    '<View style={styles.form}>\n          <VaultActionProgress state={vaultAction.state} errorMessage={vaultAction.status.error} />\n\n          <Input'
  );
  changes++;
  console.log('Progress pill added to JSX');
} else {
  console.log('Could not find JSX anchor');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Done. ' + changes + '/3 automatic edits applied.');
