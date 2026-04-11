use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use chrono::Utc;

fn build_unbearbeitet_dir(base_folder: &str, year: &str) -> PathBuf {
    let suffix_full = format!("{}/Unbearbeitet", year);
    let base = Path::new(base_folder);

    if base.ends_with(&suffix_full) {
        base.to_path_buf()
    } else if base.ends_with(year) {
        let mut p = base.to_path_buf();
        p.push("Unbearbeitet");
        p
    } else {
        let mut p = base.to_path_buf();
        p.push(year);
        p.push("Unbearbeitet");
        p
    }
}

fn build_year_dir(base_folder: &str, year: &str) -> PathBuf {
    let base = Path::new(base_folder);

    if base.ends_with(year) {
        return base.to_path_buf();
    }

    if base.ends_with("Unbearbeitet")
        || base.ends_with("Eingang")
        || base.ends_with("Bank")
        || base.ends_with("_AppData")
    {
        if let Some(parent) = base.parent() {
            if parent.ends_with(year) {
                return parent.to_path_buf();
            }
        }
    }

    if let Some(last) = base.file_name().and_then(|n| n.to_str()) {
        let is_year_folder = last.len() == 4 && last.chars().all(|c| c.is_ascii_digit());
        if is_year_folder {
            return base.to_path_buf();
        }
    }

    base.join(year)
}
fn build_bank_dir(base_folder: &str, year: &str) -> PathBuf {
    let mut p = build_year_dir(base_folder, year);
    p.push("Bank");
    p
}

fn build_bank_bearbeitet_dir(base_folder: &str, year: &str) -> PathBuf {
    let mut p = build_bank_dir(base_folder, year);
    p.push("Bearbeitet");
    p
}

fn map_fewo_to_folder_name(fewo_name: &str) -> String {
    match fewo_name {
        "Tina" => "FeWo_1_Tina".to_string(),
        "Harmony" => "FeWo_2_Harmony".to_string(),
        "Tinchen" => "FeWo_3_Tinchen".to_string(),
        "RS" => "RS".to_string(),
        "Privat" => "Privat".to_string(),
        _ => fewo_name.to_string(),
    }
}

#[tauri::command]
pub fn list_unbearbeitet(base_folder: String, year: String) -> Result<Vec<String>, String> {
    let dir = build_unbearbeitet_dir(&base_folder, &year);

    let entries = fs::read_dir(&dir)
        .map_err(|e| format!("Kann Ordner nicht lesen: {} ({})", dir.display(), e))?;

    let mut files: Vec<String> = vec![];

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        if path.is_file() {
            if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                files.push(name.to_string());
            }
        }
    }

    files.sort();
    Ok(files)
}

#[tauri::command]
pub fn read_pdf_bytes(
    base_folder: String,
    year: String,
    filename: String,
) -> Result<Vec<u8>, String> {
    let mut path = build_unbearbeitet_dir(&base_folder, &year);
    path.push(&filename);

    fs::read(&path).map_err(|e| format!("PDF konnte nicht gelesen werden: {} ({})", path.display(), e))
}

#[tauri::command]
pub fn read_eingang_pdf_bytes(
    base_folder: String,
    year: String,
    fewo_name: String,
    filename: String,
) -> Result<Vec<u8>, String> {
        let folder_name = map_fewo_to_folder_name(&fewo_name);

    let mut path = build_year_dir(&base_folder, &year);
    path.push("Eingang");
    path.push(&folder_name);
    path.push(&filename);

    fs::read(&path).map_err(|e| {
        format!(
            "Eingang-PDF konnte nicht gelesen werden: {} ({})",
            path.display(),
            e
        )
    })
}

#[tauri::command]
pub fn eingang_pdf_exists(
    base_folder: String,
    year: String,
    fewo_name: String,
    filename: String,
) -> Result<bool, String> {
    let folder_name = map_fewo_to_folder_name(&fewo_name);

    let mut path = build_year_dir(&base_folder, &year);
    path.push("Eingang");
    path.push(&folder_name);
    path.push(&filename);

    Ok(path.exists())
}

#[tauri::command]
pub fn move_to_eingang(
    base_folder: String,
    year: String,
    fewo_name: String,
    filename: String,
    new_filename: String,
) -> Result<(), String> {
    let folder_name = map_fewo_to_folder_name(&fewo_name);

    let mut source_path = build_unbearbeitet_dir(&base_folder, &year);
    source_path.push(&filename);

    let mut target_dir = build_year_dir(&base_folder, &year);
    target_dir.push("Eingang");
    target_dir.push(&folder_name);

    fs::create_dir_all(&target_dir)
        .map_err(|e| format!("Zielordner konnte nicht erstellt werden: {} ({})", target_dir.display(), e))?;

    let mut target_path = target_dir.clone();
    target_path.push(&new_filename);

    fs::rename(&source_path, &target_path).map_err(|e| {
        format!(
            "Datei konnte nicht verschoben werden: {} -> {} ({})",
            source_path.display(),
            target_path.display(),
            e
        )
    })?;

    Ok(())
}

#[tauri::command]
pub fn move_to_custom_folder(
    source_base_folder: String,
    year: String,
    filename: String,
    target_dir: String,
) -> Result<(), String> {
    use std::fs;
    use std::path::PathBuf;

    let source_path = PathBuf::from(&source_base_folder)
    .join("Unbearbeitet")
    .join(&filename);

    let target_dir_path = PathBuf::from(&target_dir);
    let target_path = target_dir_path.join(&filename);

    if !source_path.exists() {
        return Err(format!(
            "Quelldatei nicht gefunden: {}",
            source_path.display()
        ));
    }

    fs::create_dir_all(&target_dir_path)
        .map_err(|e| format!("Zielordner konnte nicht erstellt werden: {e}"))?;

    match fs::rename(&source_path, &target_path) {
        Ok(_) => Ok(()),
        Err(_) => {
            fs::copy(&source_path, &target_path)
                .map_err(|e| format!("Kopieren fehlgeschlagen: {e}"))?;

            fs::remove_file(&source_path)
                .map_err(|e| format!("Original konnte nicht gelöscht werden: {e}"))?;

            Ok(())
        }
    }
}

#[tauri::command]
pub fn bank_speichern(
    base_folder: String,
    year: String,
    content: String,
) -> Result<String, String> {
    let dir = build_bank_bearbeitet_dir(&base_folder, &year);

    fs::create_dir_all(&dir)
        .map_err(|e| format!("Ordner konnte nicht erstellt werden: {} ({})", dir.display(), e))?;

    let parsed: serde_json::Value =
        serde_json::from_str(&content).map_err(|e| format!("JSON Fehler: {}", e))?;

    let monat_roh = if let Some(obj) = parsed.as_object() {
        if let Some(import_id) = obj.get("importId").and_then(|v| v.as_str()) {
            import_id.to_string()
        } else if let Some(bookings) = obj.get("bookings").and_then(|v| v.as_array()) {
            if let Some(first) = bookings.first() {
                if let Some(datum) = first.get("bookingDate").and_then(|d| d.as_str()) {
                    if datum.len() >= 7 {
                        datum[..7].to_string()
                    } else {
                        format!("{}-unbekannt", year)
                    }
                } else {
                    format!("{}-unbekannt", year)
                }
            } else {
                format!("{}-leer", year)
            }
        } else {
            format!("{}-unbekannt", year)
        }
    } else if let Some(arr) = parsed.as_array() {
        if let Some(first) = arr.first() {
            if let Some(datum) = first.get("datum").and_then(|d| d.as_str()) {
                if datum.len() >= 7 {
                    datum[..7].to_string()
                } else {
                    format!("{}-unbekannt", year)
                }
            } else {
                format!("{}-unbekannt", year)
            }
        } else {
            format!("{}-leer", year)
        }
    } else {
        format!("{}-fehler", year)
    };

    let monat = monat_roh
        .strip_suffix("-bank-daten")
        .or_else(|| monat_roh.strip_suffix("-bank"))
        .unwrap_or(&monat_roh)
        .to_string();

    let mut file_path = dir.clone();
    file_path.push(format!("{}-bank-daten.json", monat));

    fs::write(&file_path, content)
        .map_err(|e| format!("Datei konnte nicht gespeichert werden: {} ({})", file_path.display(), e))?;

    Ok(file_path.display().to_string())
}

#[tauri::command]
pub fn bank_datei_oeffnen(pfad: String) -> Result<String, String> {
    let file_path = PathBuf::from(&pfad);

    if !file_path.exists() {
        return Err(format!("Datei nicht gefunden: {}", file_path.display()));
    }

    if !file_path.is_file() {
        return Err(format!("Pfad ist keine Datei: {}", file_path.display()));
    }

    fs::read_to_string(&file_path)
        .map_err(|e| format!("Datei konnte nicht gelesen werden: {} ({})", file_path.display(), e))
}

#[tauri::command]
pub fn bank_datei_oeffnen_bytes(pfad: String) -> Result<Vec<u8>, String> {
    std::fs::read(&pfad).map_err(|e| e.to_string())
}

#[derive(Serialize)]
pub struct EingangBelegInfo {
    filename: String,
    fewo_name: String,
}

#[tauri::command]
pub fn list_eingang_belege(
    base_folder: String,
    year: String,
    fewo_name: String,
) -> Result<Vec<EingangBelegInfo>, String> {
    let folder_name = map_fewo_to_folder_name(&fewo_name);

    let mut dir = build_year_dir(&base_folder, &year);
    dir.push("Eingang");
    dir.push(&folder_name);

    let entries = fs::read_dir(&dir)
        .map_err(|e| format!("Kann Eingang-Ordner nicht lesen: {} ({})", dir.display(), e))?;

    let mut files: Vec<EingangBelegInfo> = vec![];

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        if path.is_file() {
            if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                // Mac-Systemdateien ignorieren (.DS_Store etc.)
                if name.starts_with(".") {
                    continue;
                }

                files.push(EingangBelegInfo {
                    filename: name.to_string(),
                    fewo_name: fewo_name.clone(),
                });
            }
        }
    }

    files.sort_by(|a, b| a.filename.cmp(&b.filename));
    Ok(files)
}

#[derive(Serialize)]
pub struct OcrWord {
    text: String,
    x: f32,
    y: f32,
    width: f32,
    height: f32,
}

#[derive(Serialize)]
pub struct OcrResult {
    text: String,
    words: Vec<OcrWord>,
}

#[tauri::command]
pub fn run_ocr_placeholder(
    base_folder: String,
    year: String,
    filename: String,
) -> Result<OcrResult, String> {
    let mut pdf_path = build_unbearbeitet_dir(&base_folder, &year);
    pdf_path.push(&filename);

    let output_prefix = "/Users/thomaskuster/Desktop/fewo_ocr_test";

let convert = Command::new("pdftoppm")
    .arg("-png")
    .arg("-f")
    .arg("1")
    .arg("-singlefile")
    .arg(&pdf_path)
    .arg(output_prefix)
    .output()
    .map_err(|e| format!("PDF->Bild Fehler: {}", e))?;

if !convert.status.success() {
    let err_text = String::from_utf8_lossy(&convert.stderr).to_string();
    return Err(format!("PDF konnte nicht in Bild umgewandelt werden: {}", err_text));
}

let image_file = "/Users/thomaskuster/Desktop/fewo_ocr_test.png";

let ocr_text = Command::new("tesseract")
    .arg(image_file)
    .arg("stdout")
    .arg("-l")
    .arg("eng")
    .output()
    .map_err(|e| format!("OCR Fehler: {}", e))?;

if !ocr_text.status.success() {
    let err_text = String::from_utf8_lossy(&ocr_text.stderr).to_string();
    return Err(format!("OCR konnte nicht ausgeführt werden: {}", err_text));
}

let text = String::from_utf8_lossy(&ocr_text.stdout).to_string();

let ocr_tsv = Command::new("tesseract")
    .arg(image_file)
    .arg("stdout")
    .arg("-l")
    .arg("eng")
    .arg("tsv")
    .output()
    .map_err(|e| format!("OCR-TSV Fehler: {}", e))?;

if !ocr_tsv.status.success() {
    let err_text = String::from_utf8_lossy(&ocr_tsv.stderr).to_string();
    return Err(format!("OCR-TSV konnte nicht ausgeführt werden: {}", err_text));
}

let tsv_text = String::from_utf8_lossy(&ocr_tsv.stdout).to_string();

let mut words: Vec<OcrWord> = Vec::new();

for (index, line) in tsv_text.lines().enumerate() {
    if index == 0 {
        continue;
    }

    let cols: Vec<&str> = line.split('\t').collect();

    if cols.len() < 12 {
        continue;
    }

    let raw_text = cols[11].trim();

    if raw_text.is_empty() {
        continue;
    }

    let left = cols[6].parse::<f32>().unwrap_or(0.0);
    let top = cols[7].parse::<f32>().unwrap_or(0.0);
    let width = cols[8].parse::<f32>().unwrap_or(0.0);
    let height = cols[9].parse::<f32>().unwrap_or(0.0);

    if width <= 0.0 || height <= 0.0 {
        continue;
    }

    words.push(OcrWord {
        text: raw_text.to_string(),
        x: left,
        y: top,
        width,
        height,
    });
}

Ok(OcrResult { text, words })
}

#[tauri::command]
pub fn make_searchable_pdf(
    base_folder: String,
    year: String,
    filename: String,
) -> Result<Vec<u8>, String> {
    let mut input_path = build_unbearbeitet_dir(&base_folder, &year);
    input_path.push(&filename);

    // OCR-PDF in TEMP Ordner statt Tresorit
    let mut output_path = std::env::temp_dir();
    output_path.push(format!("fewo_ocr_{}", filename));

    let ocr = Command::new("ocrmypdf")
        .arg("--force-ocr")
        .arg(&input_path)
        .arg(&output_path)
        .output()
        .map_err(|e| format!("OCRmyPDF Fehler: {}", e))?;

    if !ocr.status.success() {
        let err = String::from_utf8_lossy(&ocr.stderr);
        return Err(format!("OCRmyPDF konnte nicht ausgeführt werden: {}", err));
    }

    fs::read(&output_path)
        .map_err(|e| format!("OCR PDF konnte nicht gelesen werden: {}", e))
}

fn belege_datei_pfad(base_folder: &str, _year: &str) -> PathBuf {
    PathBuf::from(base_folder)
        .join("_AppData")
        .join("belege.json")
}

#[tauri::command]
pub fn belege_laden(base_folder: String, year: String) -> Result<String, String> {
    let pfad = belege_datei_pfad(&base_folder, &year);

    if !pfad.exists() {
        return Ok("[]".to_string());
    }

    fs::read_to_string(&pfad).map_err(|e| format!("Belege laden fehlgeschlagen: {}", e))
}

#[tauri::command]
pub fn belege_speichern(base_folder: String, year: String, json: String) -> Result<(), String> {
    let pfad = belege_datei_pfad(&base_folder, &year);

    if let Some(parent) = pfad.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("_AppData Ordner konnte nicht angelegt werden: {}", e))?;
    }

    fs::write(&pfad, json).map_err(|e| format!("Belege speichern fehlgeschlagen: {}", e))
}

fn jahresdatei_pfad(base_folder: &str, year: &str) -> PathBuf {
    build_year_dir(base_folder, year)
        .join("_AppData")
        .join(format!("{}.json", year))
}


#[tauri::command]
pub fn jahresdatei_laden(base_folder: String, year: String) -> Result<String, String> {
    let pfad = jahresdatei_pfad(&base_folder, &year);

    if !pfad.exists() {
        let now = Utc::now().to_rfc3339();

        let leere_jahresdatei = format!(
            r#"{{
  "jahr": {},
  "version": 1,
  "createdAt": "{}",
  "updatedAt": "{}",
  "fewos": [
    {{ "id": "tina", "name": "Tina", "objektNr": "264810" }},
    {{ "id": "harmony", "name": "Harmony", "objektNr": "264817" }},
    {{ "id": "tinchen", "name": "Tinchen", "objektNr": "264816" }}
  ],
  "belege": [],
  "erloese": [],
  "bankbuchungen": []
}}"#,
            year,
            now,
            now
        );

        return Ok(leere_jahresdatei);
    }

    fs::read_to_string(&pfad)
        .map_err(|e| format!("Jahresdatei laden fehlgeschlagen: {}", e))
}

#[tauri::command]
pub fn jahresdatei_speichern(
    base_folder: String,
    year: String,
    json: String,
) -> Result<(), String> {
    let pfad = jahresdatei_pfad(&base_folder, &year);

    if let Some(parent) = pfad.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("_AppData Ordner konnte nicht angelegt werden: {}", e))?;
    }

    fs::write(&pfad, json).map_err(|e| format!("Jahresdatei speichern fehlgeschlagen: {}", e))
}

#[tauri::command]
fn remove_dir_if_exists(path: &Path) -> Result<(), String> {
    if path.exists() {
        fs::remove_dir_all(path)
            .map_err(|e| format!("Ordner konnte nicht entfernt werden: {} ({})", path.display(), e))?;
    }

    Ok(())
}

fn copy_dir_recursive(source: &Path, target: &Path) -> Result<(), String> {
    if !source.exists() {
        return Ok(());
    }

    fs::create_dir_all(target)
        .map_err(|e| format!("Zielordner konnte nicht erstellt werden: {} ({})", target.display(), e))?;

    let entries = fs::read_dir(source)
        .map_err(|e| format!("Ordner konnte nicht gelesen werden: {} ({})", source.display(), e))?;

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        let target_path = target.join(entry.file_name());

        if path.is_dir() {
            copy_dir_recursive(&path, &target_path)?;
        } else if path.is_file() {
            if let Some(parent) = target_path.parent() {
                fs::create_dir_all(parent).map_err(|e| {
                    format!(
                        "Unterordner konnte nicht erstellt werden: {} ({})",
                        parent.display(),
                        e
                    )
                })?;
            }

            fs::copy(&path, &target_path).map_err(|e| {
                format!(
                    "Datei konnte nicht kopiert werden: {} -> {} ({})",
                    path.display(),
                    target_path.display(),
                    e
                )
            })?;
        }
    }

    Ok(())
}

#[tauri::command]
pub fn jahresdatei_backup_erstellen(
    base_folder: String,
    year: String,
) -> Result<(), String> {
    let original_json = jahresdatei_pfad(&base_folder, &year);

    if !original_json.exists() {
        return Err("Original-Jahresdatei nicht gefunden".into());
    }

    let year_dir = build_year_dir(&base_folder, &year);
    let appdata_dir = year_dir.join("_AppData");
    let backup_json = appdata_dir.join(format!("{}_backup.json", year));
    let snapshot_root = appdata_dir.join(format!("{}_snapshot", year));
    let snapshot_unbearbeitet = snapshot_root.join("Unbearbeitet");
    let snapshot_eingang = snapshot_root.join("Eingang");

    fs::create_dir_all(&appdata_dir)
        .map_err(|e| format!("_AppData Ordner konnte nicht angelegt werden: {}", e))?;

    fs::copy(&original_json, &backup_json).map_err(|e| {
        format!(
            "Backup der Jahresdatei fehlgeschlagen: {} -> {} ({})",
            original_json.display(),
            backup_json.display(),
            e
        )
    })?;

    remove_dir_if_exists(&snapshot_root)?;
    fs::create_dir_all(&snapshot_root)
        .map_err(|e| format!("Snapshot-Ordner konnte nicht angelegt werden: {} ({})", snapshot_root.display(), e))?;

    let unbearbeitet_dir = year_dir.join("Unbearbeitet");
    let eingang_dir = year_dir.join("Eingang");

    copy_dir_recursive(&unbearbeitet_dir, &snapshot_unbearbeitet)?;
    copy_dir_recursive(&eingang_dir, &snapshot_eingang)?;

    Ok(())
}

#[tauri::command]
pub fn jahresdatei_backup_restore(
    base_folder: String,
    year: String,
) -> Result<(), String> {
    let original_json = jahresdatei_pfad(&base_folder, &year);
    let year_dir = build_year_dir(&base_folder, &year);
    let appdata_dir = year_dir.join("_AppData");
    let backup_json = appdata_dir.join(format!("{}_backup.json", year));
    let snapshot_root = appdata_dir.join(format!("{}_snapshot", year));
    let snapshot_unbearbeitet = snapshot_root.join("Unbearbeitet");
    let snapshot_eingang = snapshot_root.join("Eingang");
    // Backup & Snapshot nach erfolgreichem Restore löschen
    let _ = fs::remove_file(&backup_json);
    let _ = fs::remove_dir_all(&snapshot_root);

    if !backup_json.exists() {
        return Err("Kein Backup der Jahresdatei gefunden".into());
    }

    if !snapshot_root.exists() {
        return Err("Kein Datei-Snapshot gefunden".into());
    }

    if let Some(parent) = original_json.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("_AppData Ordner konnte nicht angelegt werden: {}", e))?;
    }

    fs::copy(&backup_json, &original_json).map_err(|e| {
        format!(
            "Restore der Jahresdatei fehlgeschlagen: {} -> {} ({})",
            backup_json.display(),
            original_json.display(),
            e
        )
    })?;

    let unbearbeitet_dir = year_dir.join("Unbearbeitet");
    let eingang_dir = year_dir.join("Eingang");

    remove_dir_if_exists(&unbearbeitet_dir)?;
    remove_dir_if_exists(&eingang_dir)?;

        fs::create_dir_all(&unbearbeitet_dir).map_err(|e| {
        format!(
            "Unbearbeitet konnte nicht neu angelegt werden: {} ({})",
            unbearbeitet_dir.display(),
            e
        )
    })?;

    fs::create_dir_all(&eingang_dir).map_err(|e| {
        format!(
            "Eingang konnte nicht neu angelegt werden: {} ({})",
            eingang_dir.display(),
            e
        )
    })?;

    copy_dir_recursive(&snapshot_unbearbeitet, &unbearbeitet_dir)?;
    copy_dir_recursive(&snapshot_eingang, &eingang_dir)?;

    // Backup & Snapshot nach erfolgreichem Restore löschen
    let _ = fs::remove_file(&backup_json);
    let _ = fs::remove_dir_all(&snapshot_root);

    Ok(())
}

#[tauri::command]
pub fn jahresdatei_backup_status(
    base_folder: String,
    year: String,
) -> Result<bool, String> {
    let year_dir = build_year_dir(&base_folder, &year);
    let appdata_dir = year_dir.join("_AppData");
    let backup_json = appdata_dir.join(format!("{}_backup.json", year));
    let snapshot_root = appdata_dir.join(format!("{}_snapshot", year));

    Ok(backup_json.exists() && snapshot_root.exists())
}

#[tauri::command]
pub fn relpath_pdf_exists(
    base_folder: String,
    year: String,
    rel_path: String,
) -> Result<bool, String> {
    let mut path = build_year_dir(&base_folder, &year);
    path.push(&rel_path);

    Ok(path.exists())
}

#[tauri::command]
pub fn pdf_im_system_oeffnen(
    base_folder: String,
    year: String,
    relpath: String,
) -> Result<(), String> {
    let mut full_path = build_year_dir(&base_folder, &year);
    full_path.push(&relpath);

    if !full_path.exists() {
        return Err(format!("Datei nicht gefunden: {}", full_path.display()));
    }

    if !full_path.is_file() {
        return Err(format!("Pfad ist keine Datei: {}", full_path.display()));
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&full_path)
            .status()
            .map_err(|e| format!("PDF konnte nicht geöffnet werden: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", "", &full_path.to_string_lossy()])
            .status()
            .map_err(|e| format!("PDF konnte nicht geöffnet werden: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&full_path)
            .status()
            .map_err(|e| format!("PDF konnte nicht geöffnet werden: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
pub fn read_pdf_bytes_by_relpath(
    base_folder: String,
    year: String,
    rel_path: String,
) -> Result<Vec<u8>, String> {
    let mut path = build_year_dir(&base_folder, &year);
    path.push(&rel_path);

    fs::read(&path).map_err(|e| {
        format!(
            "PDF konnte nicht gelesen werden: {} ({})",
            path.display(),
            e
        )
    })
}


#[tauri::command]
pub fn open_file_extern(pfad: String) -> Result<(), String> {
    use std::process::Command;

    if !std::path::Path::new(&pfad).exists() {
        return Err(format!("Datei nicht gefunden: {}", pfad));
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&pfad)
            .spawn()
            .map_err(|e| format!("Fehler beim Öffnen: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", "", &pfad])
            .spawn()
            .map_err(|e| format!("Fehler beim Öffnen: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&pfad)
            .spawn()
            .map_err(|e| format!("Fehler beim Öffnen: {}", e))?;
    }

    Ok(())
}
