import fs from "fs-extra";

export async function getBackupPath(targetPath: string): Promise<string> {
	if (!(await fs.pathExists(targetPath))) {
		// This should not happen if called correctly, but as a safeguard:
		return targetPath;
	}

	let backupPath = `${targetPath}.bak`;
	let counter = 1;

	while (await fs.pathExists(backupPath)) {
		counter++;
		backupPath = `${targetPath}.bak${counter}`;
	}
	return backupPath;
}
