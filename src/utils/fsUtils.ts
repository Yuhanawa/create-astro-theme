import path from "node:path";
import fs from "fs-extra";
import { getBackupPath } from "./pathUtils";

//! TODO gen by ai, need review
/**
 * Recursively copies a directory. If a file being copied already exists
 * in the destination, the existing file is renamed with a .bak extension,
 * and the new file is then copied. Directories are merged without being renamed.
 * @param source The source directory.
 * @param target The destination directory.
 * @param showLog Whether to log actions to the console.
 */
export async function copyDirAndBackupFiles(source: string, target: string, showLog: boolean): Promise<void> {
	const entries = await fs.readdir(source, { withFileTypes: true });

	// Ensure the target directory exists so we can copy into it.
	await fs.ensureDir(target);

	for (const entry of entries) {
		const srcPath = path.join(source, entry.name);
		const destPath = path.join(target, entry.name);

		if (entry.isDirectory()) {
			// For directories, we just recurse. This effectively merges their contents.
			await copyDirAndBackupFiles(srcPath, destPath, showLog);
		} else if (entry.isFile()) {
			// For files, we check for a conflict at the destination.
			if (await fs.pathExists(destPath)) {
				// If a file already exists, back it up.
				const backupPath = await getBackupPath(destPath);
				if (showLog) {
					console.log(`COPY_DIR (backup): Renaming existing file "${destPath}" to "${backupPath}"`);
				}
				await fs.move(destPath, backupPath);
			}

			// Now, copy the new file from source to destination.
			await fs.copy(srcPath, destPath);
			if (showLog) {
				console.log(`COPY_DIR (copy): ${srcPath} -> ${destPath}`);
			}
		}
		// Note: This implementation ignores symlinks and other special file types.
	}
}
