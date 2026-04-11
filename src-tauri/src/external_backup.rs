use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use tauri::command;

#[derive(Serialize)]
pub struct ExternalBackupResult {
    pub success: bool,
    pub source: String,
    pub target: String,
    pub copied_files: usize,
    pub copied_dirs: usize,
}

fn is_ignored_dir(name: &str) -> bool {
    matches!(
        name,
        ".DS_Store"
            | "node_modules"
            | "target"
            | "dist"
            | ".git"
    )
}

fn copy_dir_recursive(
    source: &Path,
    target: &Path,
    copied_files: &mut usize,
    copied_dirs: &mut usize,
) -> Result<(), String> {
    if !source.exists() {
        return Err(format!("Quellordner existiert nicht: {}", source.display()));
    }

    if !target.exists() {
        fs::create_dir_all(target)
            .map_err(|e| format!("Zielordner konnte nicht erstellt werden ({}): {}", target.display(), e))?;
        *copied_dirs += 1;
    }

    let entries = fs::read_dir(source)
        .map_err(|e| format!("Quellordner konnte nicht gelesen werden ({}): {}", source.display(), e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Fehler beim Lesen eines Verzeichniseintrags: {}", e))?;
        let path = entry.path();
        let file_name = entry.file_name();
        let file_name_str = file_name.to_string_lossy();

        if is_ignored_dir(&file_name_str) {
            continue;
        }

        let target_path = target.join(&file_name);

        if path.is_dir() {
            copy_dir_recursive(&path, &target_path, copied_files, copied_dirs)?;
        } else if path.is_file() {
            if let Some(parent) = target_path.parent() {
                if !parent.exists() {
                    fs::create_dir_all(parent).map_err(|e| {
                        format!(
                            "Unterordner konnte nicht erstellt werden ({}): {}",
                            parent.display(),
                            e
                        )
                    })?;
                    *copied_dirs += 1;
                }
            }

            fs::copy(&path, &target_path).map_err(|e| {
                format!(
                    "Datei konnte nicht kopiert werden ({} -> {}): {}",
                    path.display(),
                    target_path.display(),
                    e
                )
            })?;
            *copied_files += 1;
        }
    }

    Ok(())
}

#[command]
pub fn run_external_backup(source_dir: String, backup_root_dir: String) -> Result<ExternalBackupResult, String> {
    let source = PathBuf::from(&source_dir);
    let backup_root = PathBuf::from(&backup_root_dir);

    if !source.exists() {
        return Err(format!("Quellordner existiert nicht: {}", source.display()));
    }

    if !source.is_dir() {
        return Err(format!("Quellpfad ist kein Ordner: {}", source.display()));
    }

    if !backup_root.exists() {
        fs::create_dir_all(&backup_root).map_err(|e| {
            format!(
                "Backup-Zielordner konnte nicht erstellt werden ({}): {}",
                backup_root.display(),
                e
            )
        })?;
    }

    let timestamp = chrono::Local::now().format("%Y-%m-%d_%H-%M-%S").to_string();
    let backup_folder_name = format!("Dorf-Backup_{}", timestamp);
    let target = backup_root.join(backup_folder_name);

    fs::create_dir_all(&target).map_err(|e| {
        format!(
            "Backup-Unterordner konnte nicht erstellt werden ({}): {}",
            target.display(),
            e
        )
    })?;

    let mut copied_files = 0usize;
    let mut copied_dirs = 1usize;

    copy_dir_recursive(&source, &target, &mut copied_files, &mut copied_dirs)?;

    Ok(ExternalBackupResult {
        success: true,
        source: source.display().to_string(),
        target: target.display().to_string(),
        copied_files,
        copied_dirs,
    })
}
